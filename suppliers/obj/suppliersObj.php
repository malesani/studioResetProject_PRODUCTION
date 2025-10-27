<?php
declare(strict_types=1);

require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/authManager.php");
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/permsManager.php");

class supplierObjBase
{
    protected authManager  $authManager;
    protected permsManager $permsManager;
    protected PDO          $conn;
    protected string       $company_uid;
    protected array        $user_data;

    protected const TABLE = 'data_suppliers';

    // NB: company_uid NON in questo array per coerenza con fairsObj
    protected const ALL_FIELDS = [
        'supplier_uid',

        'company_name',
        'cf',
        'piva',

        'indirizzo',
        'cap',
        'city',
        'province',
        'region',
        'state',

        'note',

        'ref_name',
        'ref_phone',
        'ref_fax',
        'ref_email',
        'ref_pec',

        'created_at',
        'updated_at',
    ];

    protected const MUTABLE_FIELDS = [
        'company_name',
        'cf',
        'piva',
        'indirizzo',
        'cap',
        'city',
        'province',
        'region',
        'state',
        'note',
        'ref_name',
        'ref_phone',
        'ref_fax',
        'ref_email',
        'ref_pec',
    ];

    protected const REQUIRED_FIELDS = ['company_name'];

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

    public function get_allFields(): array     { return self::ALL_FIELDS; }
    public function get_mutableFields(): array { return self::MUTABLE_FIELDS; }
    public function get_requiredFields(): array{ return self::REQUIRED_FIELDS; }

    protected function validateSupplier(array $data): ?string
    {
        if (isset($data['company_name']) && trim((string)$data['company_name']) === '') {
            return '`company_name` cannot be empty';
        }
        // opzionali, ma se presenti possiamo fare piccoli sanity checks
        if (isset($data['ref_email']) && $data['ref_email'] !== '' && !filter_var($data['ref_email'], FILTER_VALIDATE_EMAIL)) {
            return 'Invalid ref_email';
        }
        if (isset($data['ref_pec']) && $data['ref_pec'] !== '' && !filter_var($data['ref_pec'], FILTER_VALIDATE_EMAIL)) {
            return 'Invalid ref_pec';
        }
        return null;
    }
}

class supplierObj extends supplierObjBase
{
    private ?string $supplier_uid;
    private array   $supplier_info = [];

    public function __construct(
        authManager $authManager,
        permsManager $permsManager,
        ?string $supplier_uid = null
    ) {
        parent::__construct($authManager, $permsManager);
        $this->supplier_uid = $supplier_uid;
        if ($this->supplier_uid) {
            $this->supplier_info = $this->load_supplierInfo();
        }
    }

    private function load_supplierInfo(): array
    {
        $cols = implode(', ', array_map(fn($f) => "`$f`", self::ALL_FIELDS));
        $sql  = "SELECT $cols FROM `" . self::TABLE . "`
                 WHERE company_uid=:company_uid AND supplier_uid=:supplier_uid";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'company_uid'  => $this->company_uid,
            'supplier_uid' => $this->supplier_uid
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new Exception("Supplier not found: {$this->supplier_uid}");
        }
        return $row;
    }

    public function get_supplierInfo(): array
    {
        return $this->supplier_info;
    }

    public function insert_supplier(array $newData): array
    {
        $missing = array_diff(self::REQUIRED_FIELDS, array_keys($newData));
        if (!empty($missing)) {
            return ['success' => false, 'message' => 'supplier.create.missing', 'error' => 'Missing: ' . implode(', ', $missing)];
        }
        $err = $this->validateSupplier($newData);
        if ($err) {
            return ['success' => false, 'message' => 'supplier.create.invalid', 'error' => $err];
        }

        $supplier_uid = $this->authManager->generateUniqueUID(self::TABLE, 'supplier_uid', 8);

        try {
            $validData = array_intersect_key($newData, array_flip(self::MUTABLE_FIELDS));
            $validData['company_uid']  = $this->company_uid;
            $validData['supplier_uid'] = $supplier_uid;

            $fields = array_keys($validData);
            $cols   = implode(', ', array_map(fn($f) => "`$f`", $fields));
            $phs    = implode(', ', array_map(fn($f) => ":$f", $fields));

            $sql = "INSERT INTO `" . self::TABLE . "` ($cols) VALUES ($phs)";
            $stmt = $this->conn->prepare($sql);
            foreach ($validData as $k => $v) {
                $stmt->bindValue(":$k", $v);
            }
            $stmt->execute();

            $this->supplier_uid  = $supplier_uid;
            $this->supplier_info = $this->load_supplierInfo();

            return ['success' => true, 'message' => 'supplier.create.success', 'data' => $this->supplier_info];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'supplier.create.fatalError', 'error' => $e->getMessage()];
        }
    }

    public function set_supplierInfo(array $newData): array
    {
        if (!$this->supplier_uid) {
            return ['success' => false, 'message' => 'supplier.noUID', 'error' => 'Missing supplier_uid for update'];
        }

        $fieldsToUpdate = array_intersect(array_keys($newData), self::MUTABLE_FIELDS);
        if (!$fieldsToUpdate) {
            return ['success' => false, 'message' => 'supplier.noFieldsToUpdate', 'error' => 'No updatable fields provided'];
        }

        $err = $this->validateSupplier($newData);
        if ($err) {
            return ['success' => false, 'message' => 'supplier.invalid', 'error' => $err];
        }

        $setParts = [];
        $params   = ['company_uid' => $this->company_uid, 'supplier_uid' => $this->supplier_uid];
        foreach ($fieldsToUpdate as $f) {
            $setParts[]   = "`$f` = :$f";
            $params[$f]   = $newData[$f] ?? null;
        }

        try {
            $sql = "UPDATE `" . self::TABLE . "` SET " . implode(', ', $setParts) . "
                    WHERE company_uid=:company_uid AND supplier_uid=:supplier_uid";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            $this->supplier_info = $this->load_supplierInfo();
            return ['success' => true, 'message' => 'supplier.infoUpdated', 'data' => $this->supplier_info];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'supplier.fatalError', 'error' => $e->getMessage()];
        }
    }

    public function delete_supplier(): array
    {
        if (!$this->supplier_uid) {
            return ['success' => false, 'message' => 'supplier.noUID', 'error' => 'Missing supplier_uid for delete'];
        }
        try {
            $stmt = $this->conn->prepare("
                DELETE FROM `" . self::TABLE . "`
                WHERE company_uid=:company_uid AND supplier_uid=:supplier_uid
            ");
            $stmt->execute(['company_uid' => $this->company_uid, 'supplier_uid' => $this->supplier_uid]);
            $this->supplier_info = [];
            return ['success' => true, 'message' => 'supplier.deleted'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'supplier.fatalError', 'error' => $e->getMessage()];
        }
    }
}

class supplierObjList extends supplierObjBase
{
    /**
     * Filtri supportati:
     * - search (match su company_name/cf/piva/indirizzo/city/province/region/state/ref_name/ref_email/ref_pec)
     * - region/state (opzionali)
     */
    public function get_suppliersList(array $filters = [], bool $extractAll = false, int $page = 1, int $perPage = 25): array
    {
        try {
            $page    = max(1, (int)$page);
            $perPage = max(1, (int)$perPage);
            $offset  = ($page - 1) * $perPage;

            $wheres = ["`s`.`company_uid` = :company_uid"];
            $params = ['company_uid' => $this->company_uid];

            if (!empty($filters['search'])) {
                $wheres[] =
                    "(`s`.`company_name` LIKE :search
                    OR `s`.`cf` LIKE :search
                    OR `s`.`piva` LIKE :search
                    OR `s`.`indirizzo` LIKE :search
                    OR `s`.`city` LIKE :search
                    OR `s`.`province` LIKE :search
                    OR `s`.`region` LIKE :search
                    OR `s`.`state` LIKE :search
                    OR `s`.`ref_name` LIKE :search
                    OR `s`.`ref_email` LIKE :search
                    OR `s`.`ref_pec` LIKE :search)";
                $params['search'] = '%' . $filters['search'] . '%';
            }

            if (!empty($filters['region'])) {
                $wheres[] = "`s`.`region` = :region";
                $params['region'] = $filters['region'];
            }
            if (!empty($filters['state'])) {
                $wheres[] = "`s`.`state` = :state";
                $params['state'] = $filters['state'];
            }

            $whereSql = $wheres ? ('WHERE ' . implode(' AND ', $wheres)) : '';
            $cols     = implode(', ', array_map(fn($f) => "`s`.`$f`", self::ALL_FIELDS));

            $sql = "
                SELECT SQL_CALC_FOUND_ROWS
                    $cols
                FROM `" . self::TABLE . "` s
                $whereSql
                ORDER BY `s`.`company_name` ASC, `s`.`updated_at` DESC, `s`.`supplier_uid` DESC
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

            $return = ['success' => true, 'message' => 'supplier.getlist.success'];

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
            return ['success' => false, 'message' => 'supplier.getlist.error', 'error' => $e->getMessage()];
        }
    }
}
