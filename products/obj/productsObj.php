<?php
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/authManager.php");
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/permsManager.php");

class productObjBase
{
    protected authManager   $authManager;
    protected permsManager  $permsManager;
    protected PDO           $conn;
    protected string        $company_uid;
    protected array         $user_data;

    protected const TABLE = 'data_products';

    // Tutti i campi della tabella (escludo i timestamp dall'update/insert manuale: li gestisce MySQL)
    protected const ALL_FIELDS = [
        'art_code',
        'name',
        'description',
        'um',
        'type',
        'commission_class',
        'tax_val',
        'category',
        'subCategory',
        'purchase_price',
        'selling_price',
        'rental_price',
        'dim_X',
        'dim_Y',
        'dim_Z',
        'weigth',
        'um_dim',
        'um_weigth',
        'suppl_code',
        'suppl_name',
        'suppl_artCode',
        'suppl_note',
        'created_at',
        'updated_at'
    ];

    // Campi modificabili manualmente (no PK, no timestamp auto)
    protected const MUTABLE_FIELDS = [
        'name',
        'description',
        'um',
        'type',
        'commission_class',
        'tax_val',
        'category',
        'subCategory',
        'purchase_price',
        'selling_price',
        'rental_price',
        'dim_X',
        'dim_Y',
        'dim_Z',
        'weigth',
        'um_dim',
        'um_weigth',
        'suppl_code',
        'suppl_name',
        'suppl_artCode',
        'suppl_note'
    ];

    // Required: solo art_code e name
    protected const REQUIRED_FIELDS = ['art_code', 'name'];

    public function __construct(authManager $authManager, permsManager $permsManager)
    {
        $this->authManager  = $authManager;
        $this->permsManager = $permsManager;
        $this->conn         = $this->authManager->get_dbConn();
        $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
        $this->conn->setAttribute(PDO::ATTR_ERRMODE,        PDO::ERRMODE_EXCEPTION);

        $this->user_data    = $this->authManager->get_userData();
        $this->company_uid  = $this->user_data['company_uid'];
    }

    public function get_allFields(): array
    {
        return self::ALL_FIELDS;
    }
    public function get_requiredFields(): array
    {
        return self::REQUIRED_FIELDS;
    }
    public function get_mutableFields(): array
    {
        return self::MUTABLE_FIELDS;
    }
}


class productObj extends productObjBase
{
    private ?string $art_code;
    private array   $product_info = [];

    public function __construct(
        authManager $authManager,
        permsManager $permsManager,
        ?string $art_code = null
    ) {
        parent::__construct($authManager, $permsManager);
        $this->art_code = $art_code;
        if ($this->art_code) {
            $this->product_info = $this->load_productInfo();
        }
    }

    private function load_productInfo(): array
    {
        $cols = implode(', ', array_map(fn($f) => "`$f`", self::ALL_FIELDS));
        $sql  = "SELECT $cols FROM `" . self::TABLE . "` WHERE company_uid=:company_uid AND art_code = :art_code;";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['company_uid' => $this->company_uid, 'art_code' => $this->art_code]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new Exception("Product not found: {$this->art_code}");
        }
        return $row;
    }

    /** Update parziale: aggiorna solo i campi passati e ammessi.
     * Non richiede 'name' a meno che lo si voglia modificare.
     */
    public function set_productInfo(array $newData): array
    {
        if (!$this->art_code) {
            return [
                'success' => false,
                'message' => 'product.noArtCode',
                'error'   => 'Missing target art_code for update'
            ];
        }

        // filtra i campi modificabili
        $fieldsToUpdate = array_intersect(array_keys($newData), self::MUTABLE_FIELDS);
        if (empty($fieldsToUpdate)) {
            return [
                'success' => false,
                'message' => 'product.noFieldsToUpdate',
                'error'   => 'No updatable fields provided',
            ];
        }

        // se vogliono modificare 'name', non può essere vuoto
        if (array_key_exists('name', $newData) && trim((string)$newData['name']) === '') {
            return [
                'success' => false,
                'message' => 'product.invalidName',
                'error'   => 'Field `name` cannot be empty'
            ];
        }

        $setParts = [];
        $params   = [];
        foreach ($fieldsToUpdate as $f) {
            $setParts[] = "$f = :$f";
            // Consenti NULL espliciti
            $params[$f] = $newData[$f] ?? null;
        }
        $params['company_uid'] = $this->company_uid;
        $params['art_code'] = $this->art_code;

        $sql = sprintf(
            "UPDATE " . self::TABLE . " SET %s WHERE company_uid=:company_uid AND art_code = :art_code",
            implode(', ', $setParts)
        );

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            // aggiorna cache interna
            foreach ($fieldsToUpdate as $f) {
                $this->product_info[$f] = $newData[$f] ?? null;
            }
            // ricarico i timestamp aggiornati
            $this->product_info = $this->load_productInfo();

            return ['success' => true, 'message' => 'product.infoUpdated', 'data' => $this->product_info];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'product.fatalError',
                'error'   => $e->getMessage(),
            ];
        }
    }

    /**
     * Insert: richiede solo art_code e name. Tutto il resto è opzionale/nullable.
     * Se esiste già art_code -> errore.
     */
    public function insert_productInfo(array $newData): array
    {
        // verifica campi obbligatori
        $missing = array_diff(self::REQUIRED_FIELDS, array_keys($newData));
        if (!empty($missing)) {
            return [
                'success' => false,
                'message' => 'product.create.200.missingInfo',
                'error'   => 'Missing required fields: ' . implode(', ', $missing),
            ];
        }
        if (trim((string)$newData['art_code']) === '' || trim((string)$newData['name']) === '') {
            return [
                'success' => false,
                'message' => 'product.create.400.invalidInfo',
                'error'   => '`art_code` and `name` cannot be empty'
            ];
        }

        // dup check
        $stmt = $this->conn->prepare("SELECT 1 FROM `" . self::TABLE . "` WHERE company_uid=:company_uid AND art_code = :art_code LIMIT 1");
        $stmt->execute(['company_uid' => $this->company_uid, 'art_code' => $newData['art_code']]);
        if ($stmt->fetchColumn()) {
            return [
                'success' => false,
                'message' => 'product.create.400.duplicateArtCode',
                'error'   => "art_code already exists: {$newData['art_code']}",
            ];
        }

        try {
            // campi validi (inserisco PK + mutabili presenti)
            $validData = array_intersect_key($newData, array_flip(array_merge(['art_code'], self::MUTABLE_FIELDS)));
            $validData['company_uid'] = $this->company_uid;
            $fields       = array_keys($validData);
            $cols         = implode(', ', array_map(fn($f) => "`$f`", $fields));
            $placeholders = implode(', ', array_map(fn($f) => ":$f", $fields));

            $sql = "INSERT INTO `" . self::TABLE . "` ($cols) VALUES ($placeholders);";
            $stmt = $this->conn->prepare($sql);

            // bind con NULL permesso
            foreach ($validData as $k => $v) {
                $stmt->bindValue(":$k", $v);
            }
            $stmt->execute();

            // aggiorna interno
            $this->art_code     = $validData['art_code'];
            $this->product_info = $this->load_productInfo();

            return [
                'success' => true,
                'message' => 'product.create.200.infoInserted',
                'data' => $this->product_info
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'product.create.400.fatalError',
                'error'   => $e->getMessage(),
            ];
        }
    }

    public function delete_product(): array
    {
        if (!$this->art_code) {
            return [
                'success' => false,
                'message' => 'product.noArtCode',
                'error'   => 'Missing target art_code for delete'
            ];
        }
        try {
            $stmt = $this->conn->prepare("DELETE FROM `" . self::TABLE . "` WHERE company_uid=:company_uid AND art_code = :art_code");
            $stmt->execute(['company_uid' => $this->company_uid, 'art_code' => $this->art_code]);
            $this->product_info = [];
            return ['success' => true, 'message' => 'product.deleted'];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'product.fatalError',
                'error'   => $e->getMessage(),
            ];
        }
    }

    public function get_productInfo(): array
    {
        return $this->product_info;
    }
}


class productObjList extends productObjBase
{
    /**
     * Filtri supportati:
     * - search (match su name o art_code)
     * - category, subCategory, type
     * - supplier (match su suppl_code o suppl_name)
     * - price_min / price_max (sulla selling_price)
     * - updated_from / updated_to (date 'YYYY-MM-DD')
     *
     * @param array $filters
     * @param int   $page
     * @param int   $perPage
     * @return array{ products_list: array[], total: int, page: int, per_page: int }
     */
    public function get_productsList(array $filters = [], bool $extractAll = false, int $page = 1, int $perPage = 25): array
    {
        try {
            $page    = max(1, $page);
            $perPage = max(1, $perPage);
            $offset  = ($page - 1) * $perPage;

            $wheres = [];
            $params = [];

            $wheres[]                = "`p`.`company_uid` = :company_uid";
            $params['company_uid']   = $this->company_uid;

            if (!empty($filters['search'])) {
                $wheres[]         = "(`p`.`name` LIKE :search OR `p`.`art_code` LIKE :search)";
                $params['search'] = "%{$filters['search']}%";
            }
            if (!empty($filters['category'])) {
                $wheres[]              = "`p`.`category` = :category";
                $params['category']    = $filters['category'];
            }
            if (!empty($filters['subCategory'])) {
                $wheres[]                = "`p`.`subCategory` = :subCategory";
                $params['subCategory']   = $filters['subCategory'];
            }
            if (!empty($filters['type'])) {
                $wheres[]           = "`p`.`type` = :type";
                $params['type']     = $filters['type'];
            }
            if (!empty($filters['supplier'])) {
                $wheres[]             = "(`p`.`suppl_code` LIKE :supplier OR `p`.`suppl_name` LIKE :supplier)";
                $params['supplier']   = "%{$filters['supplier']}%";
            }

            $whereSql = $wheres ? ('WHERE ' . implode(' AND ', $wheres)) : '';
            $cols = implode(', ', array_map(fn($f) => "`p`.`$f`", self::ALL_FIELDS));

            $sql = "
                SELECT SQL_CALC_FOUND_ROWS
                    $cols
                FROM `" . self::TABLE . "` p
                  $whereSql
                ORDER BY `p`.`updated_at`
            ";

            if (!$extractAll) {
                $sql .= " LIMIT :offset, :perPage";
            }


            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":company_uid", $this->company_uid);
            foreach ($params as $k => $v) {
                $stmt->bindValue(":$k", $v);
            }

            if (!$extractAll) {
                $stmt->bindValue(':offset',  $offset,  PDO::PARAM_INT);
                $stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
            }

            $stmt->execute();

            $products_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $total         = (int)$this->conn->query("SELECT FOUND_ROWS()")->fetchColumn();

            $return = [
                'success' => true,
                'message' => 'product.getprodlist.success',
                'data'          => $products_list
            ];

            $pages_num = (int)ceil(($total ?: 0) / $perPage);

            if (!$extractAll) {
                $return['data']['rows'] = $products_list;
                $return['data']['meta'] = [
                    'items_num'     => $total,
                    'pages_num'     => $pages_num,
                    'page'          => $page,
                    'per_page'      => $perPage,
                ];
            } else {
                $return['data'] = $products_list;
            }

            return $return;
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'product.getprodlist.error',
                'error' => $e->getMessage()
            ];
        }
    }

    public function get_categoryTree(): array
    {
        try {
            $sql = "
                SELECT DISTINCT
                    TRIM(p.category)    AS category,
                    TRIM(p.subCategory) AS subCategory
                FROM `" . self::TABLE . "` p
                WHERE p.company_uid = :company_uid
                  AND p.category IS NOT NULL
                  AND TRIM(p.category) <> ''
            ";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':company_uid', $this->company_uid);
            $stmt->execute();

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Costruzione mappa categoria => lista sub uniche
            $tree = [];
            foreach ($rows as $r) {
                $cat = $r['category'];
                $sub = $r['subCategory'];

                if (!isset($tree[$cat])) {
                    $tree[$cat] = [];
                }

                // Se subCategory non è vuota/null, aggiungila se non presente
                if ($sub !== null && $sub !== '') {
                    if (!in_array($sub, $tree[$cat], true)) {
                        $tree[$cat][] = $sub;
                    }
                }
            }

            // Ordina: categorie e relative sotto-categorie
            ksort($tree, SORT_NATURAL | SORT_FLAG_CASE);
            foreach ($tree as &$subs) {
                sort($subs, SORT_NATURAL | SORT_FLAG_CASE);
            }

            return [
                'success' => true,
                'message' => 'product.categoryTree.success',
                'data'    => $tree
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'product.categoryTree.error',
                'error'   => $e->getMessage()
            ];
        }
    }
}
