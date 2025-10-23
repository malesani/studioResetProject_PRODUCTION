<?php
declare(strict_types=1);

require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/authManager.php");
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/permsManager.php");

class estimateObjBase
{
    protected authManager  $authManager;
    protected permsManager $permsManager;
    protected PDO          $conn;
    protected string       $company_uid;
    protected array        $user_data;

    protected const TABLE = 'data_estimates';

    protected const ALL_FIELDS = [
        'preventivo_uid',
        'project_uid',
        'titolo',
        'customer_uid',
        'tipo',
        'fiera',
        'stato',
        'validitaFino',
        'descrizione',
        'note',
        'importo',
        'created_at',
        'updated_at',
    ];

    // Tutti i campi aggiornabili manualmente (no PK, no timestamps)
    protected const MUTABLE_FIELDS = [
        'project_uid',
        'titolo',
        'customer_uid',
        'tipo',
        'fiera',
        'stato',
        'validitaFino',
        'descrizione',
        'note',
        'importo',
    ];

    // campi richiesti per CREATE (la PK viene generata lato server)
    protected const REQUIRED_CREATE = [
        'project_uid',
        'titolo',
        'customer_uid',
        'tipo',
        'stato',
        'validitaFino',
        'importo',
    ];

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

    public function get_allFields(): array         { return self::ALL_FIELDS; }
    public function get_mutableFields(): array      { return self::MUTABLE_FIELDS; }
    public function get_requiredCreate(): array     { return self::REQUIRED_CREATE; }

    protected function generate_uid(): string
    {
        // ULID/UUID semplice: 32 hex upper
        return strtoupper(bin2hex(random_bytes(16)));
    }
}

class estimateObj extends estimateObjBase
{
    private ?string $preventivo_uid;
    private array   $estimate_info = [];

    public function __construct(
        authManager $authManager,
        permsManager $permsManager,
        ?string $preventivo_uid = null
    ) {
        parent::__construct($authManager, $permsManager);
        $this->preventivo_uid = $preventivo_uid;
        if ($this->preventivo_uid) {
            $this->estimate_info = $this->load_estimateInfo();
        }
    }

    private function load_estimateInfo(): array
    {
        $cols = implode(', ', array_map(fn($f) => "`$f`", self::ALL_FIELDS));
        $sql  = "SELECT $cols
                 FROM `".self::TABLE."`
                 WHERE company_uid=:company_uid AND preventivo_uid=:preventivo_uid";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'company_uid'    => $this->company_uid,
            'preventivo_uid' => $this->preventivo_uid
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new Exception("Estimate not found: {$this->preventivo_uid}");
        }
        return $row;
    }

    public function get_estimateInfo(): array
    {
        return $this->estimate_info;
    }

    /** Update parziale */
    public function set_estimateInfo(array $newData): array
    {
        if (!$this->preventivo_uid) {
            return ['success'=>false,'message'=>'estimate.noUid','error'=>'Missing preventivo_uid for update'];
        }

        $fieldsToUpdate = array_intersect(array_keys($newData), self::MUTABLE_FIELDS);
        if (empty($fieldsToUpdate)) {
            return ['success'=>false,'message'=>'estimate.noFieldsToUpdate','error'=>'No updatable fields provided'];
        }

        if (array_key_exists('titolo', $newData) && trim((string)$newData['titolo']) === '') {
            return ['success'=>false,'message'=>'estimate.invalidTitle','error'=>'`titolo` cannot be empty'];
        }
        if (array_key_exists('importo', $newData) && $newData['importo'] !== null && !is_numeric($newData['importo'])) {
            return ['success'=>false,'message'=>'estimate.invalidImporto','error'=>'`importo` must be numeric'];
        }

        $setParts = [];
        $params   = ['company_uid'=>$this->company_uid, 'preventivo_uid'=>$this->preventivo_uid];
        foreach ($fieldsToUpdate as $f) {
            $setParts[]     = "`$f` = :$f";
            $params[$f]     = $newData[$f] ?? null;
        }

        $sql = "UPDATE `".self::TABLE."` SET ".implode(', ', $setParts)."
                WHERE company_uid=:company_uid AND preventivo_uid=:preventivo_uid";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            $this->estimate_info = $this->load_estimateInfo();

            return ['success'=>true,'message'=>'estimate.infoUpdated','data'=>$this->estimate_info];
        } catch (PDOException $e) {
            return ['success'=>false,'message'=>'estimate.fatalError','error'=>$e->getMessage()];
        }
    }

    /** Insert */
    public function insert_estimate(array $newData): array
    {
        $missing = array_diff(self::REQUIRED_CREATE, array_keys($newData));
        if (!empty($missing)) {
            return ['success'=>false,'message'=>'estimate.create.missing','error'=>'Missing: '.implode(', ',$missing)];
        }
        if (trim((string)$newData['titolo']) === '') {
            return ['success'=>false,'message'=>'estimate.create.invalidTitle','error'=>'`titolo` cannot be empty'];
        }
        if (!is_numeric($newData['importo'])) {
            return ['success'=>false,'message'=>'estimate.create.invalidImporto','error'=>'`importo` must be numeric'];
        }

        $preventivo_uid = $this->generate_uid();

        try {
            $validData = array_intersect_key($newData, array_flip(self::MUTABLE_FIELDS));
            $validData['preventivo_uid'] = $preventivo_uid;

            $fields       = array_keys($validData);
            $cols         = implode(', ', array_map(fn($f) => "`$f`", $fields));
            $placeholders = implode(', ', array_map(fn($f) => ":$f", $fields));

            $sql = "INSERT INTO `".self::TABLE."` (company_uid, $cols)
                    VALUES (:company_uid, $placeholders)";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':company_uid', $this->company_uid);
            foreach ($validData as $k=>$v) {
                $stmt->bindValue(":$k", $v);
            }
            $stmt->execute();

            $this->preventivo_uid = $preventivo_uid;
            $this->estimate_info  = $this->load_estimateInfo();

            return ['success'=>true,'message'=>'estimate.create.success','data'=>$this->estimate_info];
        } catch (PDOException $e) {
            return ['success'=>false,'message'=>'estimate.create.fatalError','error'=>$e->getMessage()];
        }
    }

    /** Delete */
    public function delete_estimate(): array
    {
        if (!$this->preventivo_uid) {
            return ['success'=>false,'message'=>'estimate.noUid','error'=>'Missing preventivo_uid for delete'];
        }
        try {
            $stmt = $this->conn->prepare("DELETE FROM `".self::TABLE."`
                                          WHERE company_uid=:company_uid AND preventivo_uid=:preventivo_uid");
            $stmt->execute([
                'company_uid'    => $this->company_uid,
                'preventivo_uid' => $this->preventivo_uid
            ]);
            $this->estimate_info = [];
            return ['success'=>true,'message'=>'estimate.deleted'];
        } catch (PDOException $e) {
            return ['success'=>false,'message'=>'estimate.fatalError','error'=>$e->getMessage()];
        }
    }
}

class estimateObjList extends estimateObjBase
{
    /**
     * Filtri:
     * - search (titolo|preventivo_uid LIKE)
     * - stato
     * - tipo
     * - project_uid
     *
     * @return array
     *  - se $extractAll === true: ['success', 'message', 'data' => array[]]
     *  - se $extractAll === false: ['success','message','data' => ['rows'=>[], 'meta'=>{pages_num,total,page,per_page}]]
     */
    public function get_estimatesList(array $filters = [], bool $extractAll = false, int $page = 1, int $perPage = 25): array
    {
        try {
            $page    = max(1, (int)$page);
            $perPage = max(1, (int)$perPage);
            $offset  = ($page - 1) * $perPage;

            $wheres = ["`e`.`company_uid` = :company_uid"];
            $params = ['company_uid' => $this->company_uid];

            if (!empty($filters['project_uid'])) {
                $wheres[] = "`e`.`project_uid` = :project_uid";
                $params['project_uid'] = $filters['project_uid'];
            }
            if (!empty($filters['search'])) {
                $wheres[] = "(`e`.`titolo` LIKE :search OR `e`.`preventivo_uid` LIKE :search)";
                $params['search'] = '%'.$filters['search'].'%';
            }
            if (!empty($filters['stato'])) {
                $wheres[] = "`e`.`stato` = :stato";
                $params['stato'] = $filters['stato'];
            }
            if (!empty($filters['tipo'])) {
                $wheres[] = "`e`.`tipo` = :tipo";
                $params['tipo'] = $filters['tipo'];
            }

            $whereSql = $wheres ? ('WHERE '.implode(' AND ', $wheres)) : '';
            $cols     = implode(', ', array_map(fn($f) => "`e`.`$f`", self::ALL_FIELDS));

            $sql = "
                SELECT SQL_CALC_FOUND_ROWS
                    $cols
                FROM `".self::TABLE."` e
                $whereSql
                ORDER BY `e`.`updated_at` DESC
            ";

            if (!$extractAll) {
                $sql .= " LIMIT :offset, :perPage";
            }

            $stmt = $this->conn->prepare($sql);
            foreach ($params as $k=>$v) {
                $stmt->bindValue(":$k", $v);
            }
            if (!$extractAll) {
                $stmt->bindValue(':offset',  $offset,  PDO::PARAM_INT);
                $stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
            }

            $stmt->execute();

            $rows  = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $total = (int)$this->conn->query("SELECT FOUND_ROWS()")->fetchColumn();

            $return = [
                'success' => true,
                'message' => 'estimate.getlist.success',
            ];

            if ($extractAll) {
                $return['data'] = $rows;
            } else {
                $pages_num = (int)ceil(($total ?: 0) / $perPage);
                $return['data'] = [
                    'rows' => $rows,
                    'meta' => [
                        'pages_num' => $pages_num,
                        'total'     => $total,
                        'page'      => $page,
                        'per_page'  => $perPage,
                    ]
                ];
            }
            return $return;
        } catch (Throwable $e) {
            return ['success'=>false,'message'=>'estimate.getlist.error','error'=>$e->getMessage()];
        }
    }
}
