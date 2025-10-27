<?php
declare(strict_types=1);

require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/authManager.php");
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/permsManager.php");

class fairObjBase
{
    protected authManager  $authManager;
    protected permsManager $permsManager;
    protected PDO          $conn;
    protected string       $company_uid;
    protected array        $user_data;

    protected const TABLE = 'data_fairs';

    // Tutti i campi (escludo i timestamp dagli update manuali: li gestisce MySQL)
    protected const ALL_FIELDS = [
        'fair_uid',
        'name',
        'start_date',
        'end_date',
        'location',
        'sector',
        'active',
        'website',
        'description',
        'note',
        'duration_days',
        'created_at',
        'updated_at',
    ];

    // Campi modificabili manualmente (no PK composite, no computed, no timestamps)
    protected const MUTABLE_FIELDS = [
        'name',
        'start_date',
        'end_date',
        'location',
        'sector',
        'active',
        'website',
        'description',
        'note',
    ];

    // Campi richiesti per creare una fiera
    protected const REQUIRED_FIELDS = ['name', 'start_date', 'end_date'];

    public function __construct(authManager $authManager, permsManager $permsManager)
    {
        $this->authManager  = $authManager;
        $this->permsManager = $permsManager;
        $this->conn         = $this->authManager->get_dbConn();
        $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
        $this->conn->setAttribute(PDO::ATTR_ERRMODE,        PDO::ERRMODE_EXCEPTION);

        $this->user_data   = $this->authManager->get_userData();
        $this->company_uid = $this->user_data['company_uid'];
    }

    public function get_allFields(): array        { return self::ALL_FIELDS; }
    public function get_mutableFields(): array     { return self::MUTABLE_FIELDS; }
    public function get_requiredFields(): array    { return self::REQUIRED_FIELDS; }

    protected function validateDates(string $start, string $end): ?string
    {
        // accetta formato YYYY-MM-DD
        $s = DateTime::createFromFormat('Y-m-d', $start);
        $e = DateTime::createFromFormat('Y-m-d', $end);
        if (!$s || !$e || $s->format('Y-m-d') !== $start || $e->format('Y-m-d') !== $end) {
            return 'Invalid date format. Use YYYY-MM-DD.';
        }
        if ($e < $s) {
            return 'end_date cannot be earlier than start_date.';
        }
        return null;
    }
}

class fairObj extends fairObjBase
{
    private ?string $fair_uid;
    private array   $fair_info = [];

    public function __construct(
        authManager $authManager,
        permsManager $permsManager,
        ?string $fair_uid = null
    ) {
        parent::__construct($authManager, $permsManager);
        $this->fair_uid = $fair_uid;
        if ($this->fair_uid) {
            $this->fair_info = $this->load_fairInfo();
        }
    }

    private function load_fairInfo(): array
    {
        $cols = implode(', ', array_map(fn($f) => "`$f`", self::ALL_FIELDS));
        $sql  = "SELECT $cols FROM `" . self::TABLE . "`
                 WHERE company_uid=:company_uid AND fair_uid=:fair_uid";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'company_uid' => $this->company_uid,
            'fair_uid'    => $this->fair_uid
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new Exception("Fair not found: {$this->fair_uid}");
        }
        return $row;
    }

    public function get_fairInfo(): array
    {
        return $this->fair_info;
    }

    /** INSERT: genera fair_uid automaticamente, valida date e required */
    public function insert_fair(array $newData): array
    {
        // required
        $missing = array_diff(self::REQUIRED_FIELDS, array_keys($newData));
        if (!empty($missing)) {
            return ['success' => false, 'message' => 'fair.create.missing', 'error' => 'Missing: ' . implode(', ', $missing)];
        }
        if (trim((string)$newData['name']) === '') {
            return ['success' => false, 'message' => 'fair.create.invalid', 'error' => '`name` cannot be empty'];
        }
        $dateErr = $this->validateDates((string)$newData['start_date'], (string)$newData['end_date']);
        if ($dateErr) {
            return ['success' => false, 'message' => 'fair.create.invalidDates', 'error' => $dateErr];
        }

        // genera fair_uid univoco
        $fair_uid = $this->authManager->generateUniqueUID(self::TABLE, 'fair_uid', 8);

        try {
            // dataset valido: PK + mutabili presenti
            $validData = array_intersect_key($newData, array_flip(self::MUTABLE_FIELDS));
            $validData['company_uid'] = $this->company_uid;
            $validData['fair_uid']    = $fair_uid;

            $fields = array_keys($validData);
            $cols   = implode(', ', array_map(fn($f) => "`$f`", $fields));
            $phs    = implode(', ', array_map(fn($f) => ":$f", $fields));

            $sql = "INSERT INTO `" . self::TABLE . "` ($cols) VALUES ($phs)";
            $stmt = $this->conn->prepare($sql);
            foreach ($validData as $k => $v) {
                $stmt->bindValue(":$k", $v);
            }
            $stmt->execute();

            $this->fair_uid  = $fair_uid;
            $this->fair_info = $this->load_fairInfo();

            return ['success' => true, 'message' => 'fair.create.success', 'data' => $this->fair_info];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'fair.create.fatalError', 'error' => $e->getMessage()];
        }
    }

    /** UPDATE parziale: solo campi MUTABLE + validazione date se presenti */
    public function set_fairInfo(array $newData): array
    {
        if (!$this->fair_uid) {
            return ['success' => false, 'message' => 'fair.noUID', 'error' => 'Missing fair_uid for update'];
        }

        $fieldsToUpdate = array_intersect(array_keys($newData), self::MUTABLE_FIELDS);
        if (!$fieldsToUpdate) {
            return ['success' => false, 'message' => 'fair.noFieldsToUpdate', 'error' => 'No updatable fields provided'];
        }
        if (array_key_exists('name', $newData) && trim((string)$newData['name']) === '') {
            return ['success' => false, 'message' => 'fair.invalidName', 'error' => '`name` cannot be empty'];
        }
        // se si aggiornano le date, validale (usa quelle nuove o quelle correnti)
        if (array_key_exists('start_date', $newData) || array_key_exists('end_date', $newData)) {
            $cur = $this->fair_info;
            $start = (string)($newData['start_date'] ?? $cur['start_date']);
            $end   = (string)($newData['end_date']   ?? $cur['end_date']);
            $dateErr = $this->validateDates($start, $end);
            if ($dateErr) {
                return ['success' => false, 'message' => 'fair.invalidDates', 'error' => $dateErr];
            }
        }

        $setParts = [];
        $params   = ['company_uid' => $this->company_uid, 'fair_uid' => $this->fair_uid];
        foreach ($fieldsToUpdate as $f) {
            $setParts[]   = "`$f` = :$f";
            $params[$f]   = $newData[$f] ?? null;
        }

        try {
            $sql = "UPDATE `" . self::TABLE . "` SET " . implode(', ', $setParts) . "
                    WHERE company_uid=:company_uid AND fair_uid=:fair_uid";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            $this->fair_info = $this->load_fairInfo();
            return ['success' => true, 'message' => 'fair.infoUpdated', 'data' => $this->fair_info];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'fair.fatalError', 'error' => $e->getMessage()];
        }
    }

    public function delete_fair(): array
    {
        if (!$this->fair_uid) {
            return ['success' => false, 'message' => 'fair.noUID', 'error' => 'Missing fair_uid for delete'];
        }
        try {
            $stmt = $this->conn->prepare("
                DELETE FROM `" . self::TABLE . "`
                WHERE company_uid=:company_uid AND fair_uid=:fair_uid
            ");
            $stmt->execute(['company_uid' => $this->company_uid, 'fair_uid' => $this->fair_uid]);
            $this->fair_info = [];
            return ['success' => true, 'message' => 'fair.deleted'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'fair.fatalError', 'error' => $e->getMessage()];
        }
    }
}

class fairObjList extends fairObjBase
{
    /**
     * Filtri supportati:
     * - search (match su name/location/website)
     * - sector
     * - active (0/1)
     * - start_from / start_to (YYYY-MM-DD)
     * - end_from / end_to   (YYYY-MM-DD)
     */
    public function get_fairsList(array $filters = [], bool $extractAll = false, int $page = 1, int $perPage = 25): array
    {
        try {
            $page    = max(1, (int)$page);
            $perPage = max(1, (int)$perPage);
            $offset  = ($page - 1) * $perPage;

            $wheres = ["`f`.`company_uid` = :company_uid"];
            $params = ['company_uid' => $this->company_uid];

            if (!empty($filters['search'])) {
                $wheres[] = "(`f`.`name` LIKE :search OR `f`.`location` LIKE :search OR `f`.`website` LIKE :search)";
                $params['search'] = '%' . $filters['search'] . '%';
            }
            if (isset($filters['active']) && $filters['active'] !== '' && $filters['active'] !== null) {
                $wheres[] = "`f`.`active` = :active";
                $params['active'] = (int)$filters['active'] ? 1 : 0;
            }
            if (!empty($filters['sector'])) {
                $wheres[] = "`f`.`sector` = :sector";
                $params['sector'] = $filters['sector'];
            }

            // Date range
            if (!empty($filters['start_from'])) {
                $wheres[] = "`f`.`start_date` >= :start_from";
                $params['start_from'] = $filters['start_from'];
            }
            if (!empty($filters['start_to'])) {
                $wheres[] = "`f`.`start_date` <= :start_to";
                $params['start_to'] = $filters['start_to'];
            }
            if (!empty($filters['end_from'])) {
                $wheres[] = "`f`.`end_date` >= :end_from";
                $params['end_from'] = $filters['end_from'];
            }
            if (!empty($filters['end_to'])) {
                $wheres[] = "`f`.`end_date` <= :end_to";
                $params['end_to'] = $filters['end_to'];
            }

            $whereSql = $wheres ? ('WHERE ' . implode(' AND ', $wheres)) : '';
            $cols     = implode(', ', array_map(fn($f) => "`f`.`$f`", self::ALL_FIELDS));

            $sql = "
                SELECT SQL_CALC_FOUND_ROWS
                    $cols
                FROM `" . self::TABLE . "` f
                $whereSql
                ORDER BY `f`.`start_date` DESC, `f`.`updated_at` DESC, `f`.`fair_uid` DESC
            ";

            if (!$extractAll) {
                $sql .= " LIMIT :offset, :perPage";
            }

            $stmt = $this->conn->prepare($sql);
            foreach ($params as $k => $v) {
                $stmt->bindValue(":$k", $v);
            }
            if (!$extractAll) {
                $stmt->bindValue(':offset',  $offset,  PDO::PARAM_INT);
                $stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
            }
            $stmt->execute();

            $rows  = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $total = (int)$this->conn->query("SELECT FOUND_ROWS()")->fetchColumn();

            $return = ['success' => true, 'message' => 'fair.getlist.success'];

            if ($extractAll) {
                $return['data'] = $rows;
            } else {
                $pages_num = (int)ceil(($total ?: 0) / $perPage);
                $return['data'] = [
                    'rows' => $rows,
                    'meta' => [
                        'items_num' => $total,
                        'pages_num' => $pages_num,
                        'page'      => $page,
                        'per_page'  => $perPage,
                    ]
                ];
            }

            return $return;
        } catch (Throwable $e) {
            return ['success' => false, 'message' => 'fair.getlist.error', 'error' => $e->getMessage()];
        }
    }
}
