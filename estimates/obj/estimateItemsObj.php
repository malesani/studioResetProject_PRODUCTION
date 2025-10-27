<?php

declare(strict_types=1);

require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/authManager.php");
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/permsManager.php");

/**
 * BASE
 */
class estimateItemObjBase
{
    protected authManager  $authManager;
    protected permsManager $permsManager;
    protected PDO          $conn;
    protected string       $company_uid;
    protected array        $user_data;

    protected const TABLE = 'data_estimate_items';

    // Tutti i campi tabella (escludo i timestamp dall'upsert manuale)
    protected const ALL_FIELDS = [
        'item_id',
        'company_uid',
        'preventivo_uid',
        'art_code',
        'quantity',
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
        'mount_price',
        'FP',
        'N',
        'V',
        'R',
        'created_at',
        'updated_at',
    ];

    // Campi aggiornabili manualmente (no PK, no company_uid/preventivo_uid, no timestamps)
    // I *_total di norma vengono ricalcolati; li escludo dagli update manuali standard.
    protected const MUTABLE_FIELDS = [
        'art_code',
        'quantity',
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
        'mount_price',
        'FP',
        'N',
        'V',
        'R',
    ];

    // Campi richiesti per creare un item a preventivo
    protected const REQUIRED_CREATE = [
        'preventivo_uid',
        'art_code',
        'name',
        // quantity opzionale (default 1.000 se assente)
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

    public function get_allFields(): array
    {
        return self::ALL_FIELDS;
    }
    public function get_mutableFields(): array
    {
        return self::MUTABLE_FIELDS;
    }
    public function get_requiredCreate(): array
    {
        return self::REQUIRED_CREATE;
    }
}

/**
 * SINGOLO ITEM
 */
class estimateItemObj extends estimateItemObjBase
{
    private ?int   $item_id;
    private array  $item_info = [];

    public function __construct(
        authManager $authManager,
        permsManager $permsManager,
        ?int $item_id = null
    ) {
        parent::__construct($authManager, $permsManager);
        $this->item_id = $item_id;
        if ($this->item_id) {
            $this->item_info = $this->load_itemInfo();
        }
    }

    private function load_itemInfo(): array
    {
        $cols = implode(', ', array_map(fn($f) => "`$f`", self::ALL_FIELDS));
        $sql  = "SELECT $cols
                 FROM `" . self::TABLE . "`
                 WHERE company_uid=:company_uid AND item_id=:item_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'company_uid' => $this->company_uid,
            'item_id'     => $this->item_id
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new Exception("Estimate item not found: {$this->item_id}");
        }
        return $row;
    }

    public function get_itemInfo(): array
    {
        return $this->item_info;
    }

    /**
     * Update parziale: aggiorna solo i campi passati e ammessi.
     * Di default non aggiorna i *_total: usa set_itemTotals() se vuoi forzarli.
     */
    public function set_itemInfo(array $newData): array
    {
        if (!$this->item_id) {
            return ['success' => false, 'message' => 'estimateItem.noId', 'error' => 'Missing item_id for update'];
        }

        $fieldsToUpdate = array_intersect(array_keys($newData), self::MUTABLE_FIELDS);
        if (empty($fieldsToUpdate)) {
            return ['success' => false, 'message' => 'estimateItem.noFieldsToUpdate', 'error' => 'No updatable fields provided'];
        }

        // Validazioni minime
        if (array_key_exists('name', $newData) && trim((string)$newData['name']) === '') {
            return ['success' => false, 'message' => 'estimateItem.invalidName', 'error' => '`name` cannot be empty'];
        }
        if (array_key_exists('quantity', $newData)) {
            $q = $newData['quantity'];
            if ($q !== null && (!is_numeric($q) || (float)$q < 0)) {
                return ['success' => false, 'message' => 'estimateItem.invalidQty', 'error' => '`quantity` must be >= 0'];
            }
        }

        $params = ['company_uid' => $this->company_uid, 'item_id' => $this->item_id];
        $setParts = [];
        foreach ($fieldsToUpdate as $f) {
            $setParts[] = "`$f` = :$f";
            $params[$f] = $newData[$f] ?? null;
        }

        try {
            if ($setParts) {
                $sql = "UPDATE `" . self::TABLE . "` SET " . implode(', ', $setParts) . "
                        WHERE company_uid=:company_uid AND item_id=:item_id";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute($params);
            }

            // ricarico
            $this->item_info = $this->load_itemInfo();

            return ['success' => true, 'message' => 'estimateItem.infoUpdated', 'data' => $this->item_info];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'estimateItem.fatalError', 'error' => $e->getMessage()];
        }
    }

    /**
     * Crea un item. Di default quantity=1.000 se non fornita.
     * Non si passa item_id (si usa AUTO_INCREMENT consigliato).
     */
    public function insert_item(array $newData): array
    {
        // Check required
        $missing = array_diff(self::REQUIRED_CREATE, array_keys($newData));
        if (!empty($missing)) {
            return ['success' => false, 'message' => 'estimateItem.create.missing', 'error' => 'Missing: ' . implode(', ', $missing)];
        }
        if (trim((string)$newData['art_code']) === '' || trim((string)$newData['name']) === '') {
            return ['success' => false, 'message' => 'estimateItem.create.invalid', 'error' => '`art_code` and `name` cannot be empty'];
        }
        if (trim((string)$newData['preventivo_uid']) === '') {
            return ['success' => false, 'message' => 'estimateItem.create.invalid', 'error' => '`preventivo_uid` cannot be empty'];
        }

        // default quantity
        if (!array_key_exists('quantity', $newData) || $newData['quantity'] === null || $newData['quantity'] === '') {
            $newData['quantity'] = '1.000';
        }

        // Costruisco dataset valido (company_uid + required + mutabili)
        $validKeys = array_merge(['preventivo_uid', 'art_code', 'name', 'quantity'], self::MUTABLE_FIELDS);
        $validData = array_intersect_key($newData, array_flip($validKeys));
        $validData['company_uid'] = $this->company_uid;

        $fields       = array_keys($validData);
        $cols         = implode(', ', array_map(fn($f) => "`$f`", $fields));
        $placeholders = implode(', ', array_map(fn($f) => ":$f", $fields));

        try {
            $sql = "INSERT INTO `" . self::TABLE . "` ($cols) VALUES ($placeholders)";
            $stmt = $this->conn->prepare($sql);
            foreach ($validData as $k => $v) {
                $stmt->bindValue(":$k", $v);
            }
            $stmt->execute();

            // recupero id (se AI)
            $this->item_id = (int)$this->conn->lastInsertId();
            if (!$this->item_id) {
                // Fallback: cerco l’ultimo riga per preventivo/art_code/name
                $stmt2 = $this->conn->prepare("
                    SELECT item_id FROM `" . self::TABLE . "`
                    WHERE company_uid=:company_uid AND preventivo_uid=:preventivo_uid
                      AND art_code=:art_code AND name=:name
                    ORDER BY created_at DESC, item_id DESC
                    LIMIT 1
                ");
                $stmt2->execute([
                    'company_uid'    => $this->company_uid,
                    'preventivo_uid' => $validData['preventivo_uid'],
                    'art_code'       => $validData['art_code'],
                    'name'           => $validData['name'],
                ]);
                $this->item_id = (int)($stmt2->fetchColumn() ?: 0);
            }

            if (!$this->item_id) {
                return ['success' => false, 'message' => 'estimateItem.create.idMissing', 'error' => 'Cannot determine item_id after insert'];
            }

            $this->item_info = $this->load_itemInfo();

            return ['success' => true, 'message' => 'estimateItem.create.success', 'data' => $this->item_info];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'estimateItem.create.fatalError', 'error' => $e->getMessage()];
        }
    }

    /** Delete */
    public function delete_item(): array
    {
        if (!$this->item_id) {
            return ['success' => false, 'message' => 'estimateItem.noId', 'error' => 'Missing item_id for delete'];
        }
        try {
            $stmt = $this->conn->prepare("
                DELETE FROM `" . self::TABLE . "`
                WHERE company_uid=:company_uid AND item_id=:item_id
            ");
            $stmt->execute(['company_uid' => $this->company_uid, 'item_id' => $this->item_id]);
            $this->item_info = [];
            return ['success' => true, 'message' => 'estimateItem.deleted'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'estimateItem.fatalError', 'error' => $e->getMessage()];
        }
    }
}

/**
 * LISTA ITEMS (con filtri + paginazione)
 */
class estimateItemObjList extends estimateItemObjBase
{
    /**
     * Filtri supportati:
     * - preventivo_uid (fortemente consigliato)
     * - search (match su name o art_code)
     * - category, subCategory, type
     * - supplier (match su suppl_code o suppl_name)
     * - flags: FP, N, V, R (0/1)
     *
     * @return array:
     *  se $extractAll === true:  ['success','message','data'=>array[]]
     *  se $extractAll === false: ['success','message','data'=>['rows'=>[], 'meta'=>{items_num,pages_num,page,per_page}]]
     */
    public function get_itemsList(array $filters = [], bool $extractAll = false, int $page = 1, int $perPage = 25): array
    {
        try {
            $page    = max(1, (int)$page);
            $perPage = max(1, (int)$perPage);
            $offset  = ($page - 1) * $perPage;

            $wheres = ["`i`.`company_uid` = :company_uid"];
            $params = ['company_uid' => $this->company_uid];

            if (!empty($filters['preventivo_uid'])) {
                $wheres[] = "`i`.`preventivo_uid` = :preventivo_uid";
                $params['preventivo_uid'] = $filters['preventivo_uid'];
            }
            if (!empty($filters['search'])) {
                $wheres[] = "(`i`.`name` LIKE :search OR `i`.`art_code` LIKE :search)";
                $params['search'] = "%{$filters['search']}%";
            }
            if (!empty($filters['category'])) {
                $wheres[] = "`i`.`category` = :category";
                $params['category'] = $filters['category'];
            }
            if (!empty($filters['subCategory'])) {
                $wheres[] = "`i`.`subCategory` = :subCategory";
                $params['subCategory'] = $filters['subCategory'];
            }
            if (!empty($filters['type'])) {
                $wheres[] = "`i`.`type` = :type";
                $params['type'] = $filters['type'];
            }
            if (!empty($filters['supplier'])) {
                $wheres[] = "(`i`.`suppl_code` LIKE :supplier OR `i`.`suppl_name` LIKE :supplier)";
                $params['supplier'] = "%{$filters['supplier']}%";
            }
            foreach (['FP', 'N', 'V', 'R'] as $flag) {
                if (array_key_exists($flag, $filters) && $filters[$flag] !== '' && $filters[$flag] !== null) {
                    $wheres[] = "`i`.`$flag` = :$flag";
                    $params[$flag] = (int)$filters[$flag] ? 1 : 0;
                }
            }

            $whereSql = $wheres ? ('WHERE ' . implode(' AND ', $wheres)) : '';
            $cols     = implode(', ', array_map(fn($f) => "`i`.`$f`", self::ALL_FIELDS));

            $sql = "
                SELECT SQL_CALC_FOUND_ROWS
                    $cols
                FROM `" . self::TABLE . "` i
                $whereSql
                ORDER BY `i`.`updated_at` DESC, `i`.`item_id` DESC
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

            $return = ['success' => true, 'message' => 'estimateItem.getlist.success'];

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
            return ['success' => false, 'message' => 'estimateItem.getlist.error', 'error' => $e->getMessage()];
        }
    }

    public function bulkReplaceByDeleteInsert(
        string $preventivo_uid,
        array $items,
        bool $dryRun = false
    ): array {
        if ($preventivo_uid === '') {
            return ['success' => false, 'message' => 'estimateItem.save.bulkUpdateFatalError', 'error' => 'Missing preventivo_uid'];
        }

        // Whitelist campi accettati in INSERT (niente *_total, PK, company_uid, preventivo_uid, timestamps)
        $allowed = array_unique(array_merge(
            $this->get_mutableFields(),
            ['quantity', 'art_code', 'name'] // quantity esplicito; art_code e name sono già in MUTABLE ma lascio per chiarezza
        ));

        // Validazione base su tutte le righe
        $rowNum = 0;
        foreach ($items as $row) {
            $rowNum++;
            // required del create: preventivo_uid lo forziamo noi
            $missing = array_diff($this->get_requiredCreate(), array_merge(array_keys($row), ['preventivo_uid']));
            if (!empty($missing)) {
                return [
                    'success' => false,
                    'message' => 'estimateItem.create.missing',
                    'error'   => "Row {$rowNum}: missing fields: " . implode(', ', $missing)
                ];
            }
            if (trim((string)($row['art_code'] ?? '')) === '' || trim((string)($row['name'] ?? '')) === '') {
                return [
                    'success' => false,
                    'message' => 'estimateItem.create.invalid',
                    'error'   => "Row {$rowNum}: `art_code` and `name` cannot be empty"
                ];
            }
            if (isset($row['quantity'])) {
                $q = $row['quantity'];
                if ($q !== null && $q !== '' && !is_numeric($q)) {
                    return [
                        'success' => false,
                        'message' => 'estimateItem.invalidQty',
                        'error'   => "Row {$rowNum}: `quantity` must be numeric or empty"
                    ];
                }
            }
        }

        if ($dryRun) {
            // Nessuna modifica DB: solo conferma che il payload è valido
            return [
                'success' => true,
                'message' => 'estimateItem.200.bulkValidationOk',
                'data'    => ['rows' => count($items)]
            ];
        }

        $this->conn->beginTransaction();
        try {
            // 1) Cancella tutte le righe esistenti di quel preventivo (scoped per company_uid)
            $del = $this->conn->prepare("
            DELETE FROM `" . self::TABLE . "`
            WHERE `company_uid` = :company_uid AND `preventivo_uid` = :preventivo_uid
        ");
            $del->execute([
                ':company_uid'    => $this->company_uid,
                ':preventivo_uid' => $preventivo_uid
            ]);

            // 2) Inserisci tutte le nuove righe
            $now = (new DateTimeImmutable())->format('Y-m-d H:i:s'); // se ti serve per trigger/updated_at di default DB
            $insFields = array_values(array_unique(array_merge(
                ['company_uid', 'preventivo_uid', 'art_code', 'name', 'quantity'],
                $allowed
            )));
            // rimuovi duplicati e campi vietati
            $insFields = array_values(array_diff($insFields, [
                'company_uid',
                'preventivo_uid', // li aggiungiamo noi in testa comunque
                'created_at',
                'updated_at',
                'item_id'
            ]));
            array_unshift($insFields, 'preventivo_uid');
            array_unshift($insFields, 'company_uid');
            $insFields = array_values(array_unique($insFields));

            $cols = implode(', ', array_map(fn($f) => "`$f`", $insFields));
            $phs  = implode(', ', array_map(fn($f) => ":$f", $insFields));
            $sqlIns = "INSERT INTO `" . self::TABLE . "` ($cols) VALUES ($phs)";
            $stmtIns = $this->conn->prepare($sqlIns);

            $inserted = 0;
            foreach ($items as $row) {
                // dataset filtrato
                $payload = [];
                foreach ($insFields as $f) {
                    switch ($f) {
                        case 'company_uid':
                            $payload[$f] = $this->company_uid;
                            break;
                        case 'preventivo_uid':
                            $payload[$f] = $preventivo_uid;
                            break;
                        default:
                            if (array_key_exists($f, $row)) {
                                $payload[$f] = $row[$f];
                            }
                    }
                }
                // quantity default
                if (!array_key_exists('quantity', $payload) || $payload['quantity'] === '' || $payload['quantity'] === null) {
                    $payload['quantity'] = '1.000';
                }

                // bind + execute
                foreach ($insFields as $f) {
                    $stmtIns->bindValue(":$f", $payload[$f] ?? null);
                }
                $stmtIns->execute();
                $inserted++;
            }


            $this->conn->commit();
            return [
                'success' => true,
                'message' => 'estimateItem.200.bulkReplaceSuccess',
                'data'    => ['inserted_rows' => $inserted]
            ];
        } catch (Throwable $e) {
            $this->conn->rollBack();
            return [
                'success' => false,
                'message' => 'estimateItem.save.bulkUpdateFatalError',
                'error'   => $e->getMessage()
            ];
        }
    }
}
