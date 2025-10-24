<?php
declare(strict_types=1);

use Shuchkin\SimpleXLSX; // opzionale: abilita se vuoi supportare anche XLSX

$srcPath = $_SERVER['DOCUMENT_ROOT'] ?: '/var/www/html';
require_once "$srcPath/auth/inclusions.php";
require_once "$srcPath/general_inclusions.php";

class SuppliersImportService
{
    private authManager $auth;
    private permsManager $perms;
    private PDO $conn;

    /** Campi noti tabella data_suppliers */
    private array $knownFields = [
        'supplier_uid','company_name','cf','piva','indirizzo','cap','city','province','region','state',
        'note','ref_name','ref_phone','ref_fax','ref_email','ref_pec'
    ];

    /** Mappatura IT header normalizzati → campo DB (o null) */
    private array $itHeaderMap = [
        // amministrativi
        'cod.'                   => 'supplier_uid',
        'cod'                    => 'supplier_uid',
        'denominazione'          => 'company_name',
        'codice fiscale'         => 'cf',
        'partita iva'            => 'piva',

        // indirizzi
        'indirizzo'              => 'indirizzo',
        'cap'                    => 'cap',
        'citta'                  => 'city',
        'città'                  => 'city',
        'prov.'                  => 'province',
        'prov'                   => 'province',
        'regione'                => 'region',
        'nazione'                => 'state',

        // contatti
        'referente'              => 'ref_name',
        'tel.'                   => 'ref_phone',
        'telefono'               => 'ref_phone',
        'cell'                   => '__cell',        // lo accoderemo a ref_phone
        'fax'                    => 'ref_fax',
        'e-mail'                 => 'ref_email',
        'email'                  => 'ref_email',
        'pec'                    => 'ref_pec',

        // note
        'note'                   => 'note',

        // tutto il resto ignorato (mappalo a null)
        'cod. destinatario fatt. elettr.' => null,
        'rif. ammin. fatt. elettr.'       => null,
        'sconti'                 => null,
        'listino'                => null,
        'fido'                   => null,
        'agente'                 => null,
        'pagamento'              => null,
        'banca'                  => null,
        'ns banca'               => null,
        'data mandato sdd'       => null,
        'emissione sdd'          => null,
        'resp. trasporto'        => null,
        'porto'                  => null,
        'fatt. con iva'          => null,
        "dich. d'intento"        => null,
        "data dich. d'intento"   => null,
        'conto reg.'             => null,
        'rit. acconto?'          => null,
        'doc via e-mail?'        => null,
        'avviso nuovi doc.'      => null,
        'note doc.'              => null,
        'home page'              => null,
        'login web'              => null,
        'extra 1'                => null,
        'extra 2'                => null,
        'extra 3'                => null,
        'extra 4'                => null,
        'extra 5'                => null,
        'extra 6'                => null,
    ];

    /** Alias liberi (fallback) */
    private array $aliases = [
        'ragione sociale' => 'company_name',
        'denominazione'   => 'company_name',
        'p.iva'           => 'piva',
        'partita iva'     => 'piva',
        'pi'              => 'piva',
        'cf'              => 'cf',
        'codice fiscale'  => 'cf',
        'citta'           => 'city',
        'città'           => 'city',
        'prov'            => 'province',
        'provincia'       => 'province',
        'regione'         => 'region',
        'stato'           => 'state',
        'nazione'         => 'state',
        'telefono'        => 'ref_phone',
        'tel'             => 'ref_phone',
        'cell'            => '__cell',
        'fax'             => 'ref_fax',
        'email'           => 'ref_email',
        'e-mail'          => 'ref_email',
        'pec'             => 'ref_pec',
        'referente'       => 'ref_name',
        'note'            => 'note',
        'indirizzo'       => 'indirizzo',
        'cap'             => 'cap',
        'cod'             => 'supplier_uid',
        'cod.'            => 'supplier_uid',
        'codice'          => 'supplier_uid',
    ];

    public function __construct(authManager $auth, permsManager $perms)
    {
        $this->auth  = $auth;
        $this->perms = $perms;
        $this->conn  = $auth->get_dbConn();
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    /**
     * Upload: accetta CSV/TXT/XML (ed eventualmente XLSX, se abiliti SimpleXLSX).
     */
    public function handleUpload(array $file, string $delimiter, bool $hasHeader, string $encoding): array
    {
        if (empty($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return $this->fail('suppliers.upload.missingFile', 'Missing uploaded file or upload error');
        }

        $tmpPath  = $file['tmp_name'];
        $origName = $file['name'] ?? 'upload.bin';
        $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        try {
            if ($ext === 'xml') {
                [$headers, $rows] = $this->readXmlAsTable($tmpPath, $encoding, $hasHeader);
            } elseif ($ext === 'xlsx') {
                // opzionale, se vuoi supportare anche xlsx; altrimenti togli questo ramo
                $rows = $this->readXlsxAsRows($tmpPath);
                $headers = $hasHeader ? array_shift($rows) : $this->buildFakeHeaders(count($rows[0] ?? []));
            } else {
                // CSV / TXT / fallback testo
                $text = $this->readFileAsText($tmpPath, $encoding);
                if ($delimiter === '' || $delimiter === 'auto') {
                    $delimiter = $this->detectDelimiter($text) ?? ';';
                }
                $rows = $this->readCsvTextToRows($text, $delimiter);
                $headers = $hasHeader ? array_shift($rows) : $this->buildFakeHeaders(count($rows[0] ?? []));
            }
        } catch (Throwable $e) {
            return $this->fail('suppliers.upload.parseError', $e->getMessage());
        }

        if (empty($rows)) {
            return $this->fail('suppliers.upload.emptyFile', 'No rows detected');
        }

        // normalizza header e righe
        $headers = array_map([$this, 'sanitizeHeader'], $headers);
        $colNum  = count($headers);
        $normalizedRows = [];
        foreach ($rows as $r) {
            $r = is_array($r) ? array_values($r) : [];
            if (count($r) < $colNum) $r = array_pad($r, $colNum, '');
            elseif (count($r) > $colNum) $r = array_slice($r, 0, $colNum);
            $normalizedRows[] = array_map([$this, 'normalizeCell'], $r);
        }
        $rows = $normalizedRows;

        // preview + mapping auto
        $preview = array_slice($rows, 0, 20);
        $mapping = $this->buildAutoMapping($headers);

        // salva job (incluse tutte le righe)
        $jobId = $this->createJob(
            $delimiter, $hasHeader, 'UTF-8',
            $headers, $mapping, $preview, $rows
        );

        return [
            'success' => true,
            'message' => 'suppliers.upload.ok',
            'data' => [
                'job_id'  => $jobId,
                'headers' => $headers,
                'mapping' => $mapping,
                'preview' => $preview
            ]
        ];
    }

    /** Run: dry-run o commit */
    public function handleRun(array $payload): array
    {
        $jobId  = (string)($payload['job_id'] ?? '');
        $dryRun = (bool)($payload['dry_run'] ?? true);

        if ($jobId === '') {
            return $this->fail('suppliers.run.missingJob', 'job_id is required');
        }

        $mapping = $payload['mapping'] ?? $this->loadMappingFromJob($jobId);
        if (empty($mapping) || (!is_array($mapping) && !is_object($mapping))) {
            $mapping = new stdClass();
        }

        [$headers, $rows] = $this->loadRowsFromJob($jobId);
        if (empty($headers)) {
            return $this->fail('suppliers.run.noHeaders', 'Job headers missing');
        }

        $report = $this->simulateOrCommit($headers, $rows, (array)$mapping, $dryRun);

        return [
            'success' => true,
            'message' => $dryRun ? 'suppliers.run.dry_ok' : 'suppliers.run.commit_ok',
            'data'    => [
                'job_id' => $jobId,
                'report' => $report
            ]
        ];
    }

    /* ===================== Parsing helpers ===================== */

    private function readXlsxAsRows(string $filePath): array
    {
        if (!class_exists(SimpleXLSX::class)) {
            throw new RuntimeException('SimpleXLSX not installed: composer require shuchkin/simplexlsx');
        }
        $xlsx = SimpleXLSX::parse($filePath);
        if (!$xlsx) throw new RuntimeException('XLSX error: ' . SimpleXLSX::parseError());
        $rows = [];
        foreach ($xlsx->rows() as $row) {
            $rows[] = array_map([$this, 'normalizeCell'], $row);
        }
        return $rows;
    }

    /** XML → (headers, rows). Si aspetta una lista di nodi ripetuti (es. <Suppliers><Supplier>…</Supplier>…</Suppliers>) */
    private function readXmlAsTable(string $filePath, string $encoding, bool $hasHeader): array
    {
        $xmlStr = file_get_contents($filePath);
        if ($xmlStr === false) throw new RuntimeException('Cannot read XML');

        // normalizza encoding in UTF-8
        $encs = [$encoding, 'UTF-8', 'ISO-8859-1', 'Windows-1252'];
        $det  = mb_detect_encoding($xmlStr, implode(',', $encs), true) ?: $encoding;
        $xmlU = ($det === 'UTF-8') ? $xmlStr : mb_convert_encoding($xmlStr, 'UTF-8', $det);

        $sx = @simplexml_load_string($xmlU, 'SimpleXMLElement', LIBXML_NOERROR | LIBXML_NOWARNING);
        if ($sx === false) throw new RuntimeException('Invalid XML');

        // Individua i figli ripetuti (primo livello con più elementi uguali)
        $rootChildren = iterator_to_array($sx->children());
        if (empty($rootChildren)) throw new RuntimeException('XML: no data');

        // Trova il tag ripetuto
        $byName = [];
        foreach ($rootChildren as $child) {
            $byName[$child->getName()] = ($byName[$child->getName()] ?? 0) + 1;
        }
        arsort($byName);
        $repeatingTag = array_key_first($byName);
        if (!$repeatingTag) throw new RuntimeException('XML: cannot detect repeating element');

        $rows = [];
        $headersSet = [];
        foreach ($sx->{$repeatingTag} as $node) {
            $flat = $this->flattenXml($node);
            $rows[] = $flat;
            foreach ($flat as $k => $v) $headersSet[$k] = true;
        }

        $headers = array_keys($headersSet);
        // se hasHeader==true: comunque usiamo le chiavi come intestazioni "header"
        return [$headers, array_map(fn($r) => array_values(array_replace(array_fill_keys($headers, ''), $r)), $rows)];
    }

    /** Flatten XML node (solo 1° livello dei campi testuali) */
    private function flattenXml(SimpleXMLElement $node): array
    {
        $out = [];
        foreach ($node->children() as $k => $v) {
            $out[$this->sanitizeHeader((string)$k)] = $this->normalizeCell((string)$v);
        }
        // anche attributi?
        foreach ($node->attributes() as $k => $v) {
            $key = $this->sanitizeHeader('@'.$k);
            $out[$key] = $this->normalizeCell((string)$v);
        }
        return $out;
    }

    private function readFileAsText(string $path, string $encoding = 'UTF-8'): string
    {
        $raw = file_get_contents($path);
        if ($raw === false) throw new RuntimeException('Cannot read uploaded file');

        $encs = [$encoding, 'UTF-8', 'ISO-8859-1', 'Windows-1252'];
        $det  = mb_detect_encoding($raw, implode(',', $encs), true) ?: $encoding;
        $txt  = ($det === 'UTF-8') ? $raw : mb_convert_encoding($raw, 'UTF-8', $det);

        if (strncmp($txt, "\xEF\xBB\xBF", 3) === 0) $txt = substr($txt, 3);
        return $txt;
    }

    private function detectDelimiter(string $text): ?string
    {
        $firstLine = strtok($text, "\r\n");
        if ($firstLine === false) return null;
        $cands = [';', ',', "\t", '|'];
        $best = null; $bestCount = -1;
        foreach ($cands as $d) {
            $count = substr_count($firstLine, $d);
            if ($count > $bestCount) { $best=$d; $bestCount=$count; }
        }
        return $best;
    }

    private function readCsvTextToRows(string $text, string $delimiter): array
    {
        $rows = [];
        $fh = fopen('php://memory', 'r+');
        fwrite($fh, $text);
        rewind($fh);
        while (($row = fgetcsv($fh, 0, $delimiter)) !== false) {
            $rows[] = array_map([$this, 'normalizeCell'], $row);
        }
        fclose($fh);
        return $rows;
    }

    private function normalizeCell($v): string
    {
        if ($v === null) return '';
        $s = (string)$v;
        $s = str_replace("\x00", '', $s);
        $s = preg_replace('/[[:cntrl:]]/u', '', $s);
        return trim($s);
    }

    private function buildFakeHeaders(int $n): array
    {
        $headers = [];
        for ($i = 0; $i < $n; $i++) $headers[] = "col_$i";
        return $headers;
    }

    private function sanitizeHeader(string $h): string
    {
        $h = str_replace("\x00", '', $h);
        $h = preg_replace('/[[:cntrl:]]/u', '', $h);
        $h = trim($h);
        $h = str_replace(['.', '’', '\''], ' ', $h);
        $h = $this->stripAccents($h);
        $h = preg_replace('/\s+/', ' ', $h);
        $h = mb_strtolower($h);
        return $h;
    }

    private function stripAccents(string $s): string
    {
        $out = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
        return $out !== false ? $out : $s;
    }

    private function buildAutoMapping(array $headers): array
    {
        $mapping = [];
        foreach ($headers as $originalH) {
            $norm = $this->sanitizeHeader($originalH);
            if (array_key_exists($norm, $this->itHeaderMap)) {
                $mapping[$originalH] = $this->itHeaderMap[$norm];
                continue;
            }

            // fallback: se l'header coincide con un campo DB
            if (in_array($originalH, $this->knownFields, true)) {
                $mapping[$originalH] = $originalH;
                continue;
            }

            // fallback alias liberi
            $low = mb_strtolower($originalH);
            $mapping[$originalH] = $this->aliases[$low] ?? null;
        }
        return $mapping;
    }

    /* ============== Job storage (riusa data_import_jobs) ============== */

    private function createJob(
        string $delimiter,
        bool $hasHeader,
        string $encoding,
        array $headers,
        array $mapping,
        array $preview,
        array $allRows
    ): string {
        $jobId = bin2hex(random_bytes(8));

        $mappingJson = json_encode($mapping, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE) ?: '{}';
        $headersJson = json_encode($headers, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE) ?: '[]';
        $previewJson = json_encode($preview, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE) ?: '[]';
        $rowsJson    = json_encode($allRows, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE) ?: '[]';

        $sql = "INSERT INTO data_import_jobs
            (job_id, company_uid, delimiter, has_header, encoding, headers_json, mapping_json, preview_json, rows_json, created_at)
            VALUES (:job_id, :company_uid, :delimiter, :has_header, :encoding, :headers_json, :mapping_json, :preview_json, :rows_json, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':job_id'       => $jobId,
            ':company_uid'  => $this->auth->get_userData()['company_uid'],
            ':delimiter'    => $delimiter,
            ':has_header'   => $hasHeader ? 1 : 0,
            ':encoding'     => $encoding,
            ':headers_json' => $headersJson,
            ':mapping_json' => $mappingJson,
            ':preview_json' => $previewJson,
            ':rows_json'    => $rowsJson,
        ]);

        return $jobId;
    }

    private function loadMappingFromJob(string $jobId)
    {
        $stmt = $this->conn->prepare("SELECT mapping_json FROM data_import_jobs WHERE job_id=:j AND company_uid=:c LIMIT 1");
        $stmt->execute([
            ':j' => $jobId,
            ':c' => $this->auth->get_userData()['company_uid']
        ]);
        $json = $stmt->fetchColumn();
        if (!$json) return [];
        $data = json_decode((string)$json, true);
        return is_array($data) ? $data : [];
    }

    private function loadRowsFromJob(string $jobId): array
    {
        $stmt = $this->conn->prepare(
            "SELECT headers_json, rows_json, preview_json
             FROM data_import_jobs
             WHERE job_id=:j AND company_uid=:c
             LIMIT 1"
        );
        $stmt->execute([
            ':j' => $jobId,
            ':c' => $this->auth->get_userData()['company_uid']
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $headers = json_decode((string)($row['headers_json'] ?? '[]'), true) ?: [];
        $rows = json_decode((string)($row['rows_json'] ?? '[]'), true);
        if (!is_array($rows) || empty($rows)) {
            $rows = json_decode((string)($row['preview_json'] ?? '[]'), true) ?: [];
        }

        return [$headers, $rows];
    }

    /* ===================== Simulate / Commit ===================== */

    private function simulateOrCommit(array $headers, array $rows, array $mapping, bool $dryRun): array
    {
        $idxOf = array_flip($headers);

        $report = [
            'rows_total'   => count($rows),
            'rows_invalid' => 0,
            'inserted'     => 0,
            'updated'      => 0,
            'skipped'      => 0,
            'errors'       => [],
        ];

        foreach ($rows as $i => $row) {
            $sup = [];

            // Applica mapping
            foreach ($mapping as $fromHeader => $toField) {
                if (!$toField) continue;
                if (is_string($toField) && str_starts_with($toField, '__')) {
                    // placeholder speciali (__cell) gestiti dopo
                    continue;
                }
                $col = $idxOf[$fromHeader] ?? null;
                $val = ($col !== null && array_key_exists($col, $row)) ? $row[$col] : null;
                $sup[$toField] = $val;
            }

            // Gestione speciale "Cell" → accoda a ref_phone se presente
            $cellHeader = $this->findHeaderByNorm($headers, 'cell');
            if ($cellHeader !== null) {
                $col = $idxOf[$cellHeader];
                $cell = $this->normalizeCell($row[$col] ?? '');
                if ($cell !== '') {
                    if (!empty($sup['ref_phone'])) {
                        $sup['ref_phone'] .= ' / ' . $cell;
                    } else {
                        $sup['ref_phone'] = $cell;
                    }
                }
            }

            // Validazioni minime
            $companyName = trim((string)($sup['company_name'] ?? ''));
            if ($companyName === '') {
                $report['rows_invalid']++;
                $report['errors'][] = [
                    'row'   => $i + 1,
                    'code'  => $sup['supplier_uid'] ?? null,
                    'errors'=> ['company_name is required']
                ];
                continue;
            }

            // Se non c'è supplier_uid, prova a prenderlo da file; se manca, generiamo in commit
            $supplierUid = trim((string)($sup['supplier_uid'] ?? ''));

            if ($dryRun) {
                if ($supplierUid !== '' && $this->supplierExists($supplierUid)) {
                    $report['updated']++;
                } else {
                    $report['inserted']++;
                }
                continue;
            }

            // COMMIT
            if ($supplierUid !== '' && $this->supplierExists($supplierUid)) {
                // UPDATE
                $ok = $this->updateSupplier($supplierUid, $sup);
                if ($ok) $report['updated']++;
                else {
                    $report['rows_invalid']++;
                    $report['errors'][] = ['row'=>$i+1, 'code'=>$supplierUid, 'errors'=>['update_error']];
                }
            } else {
                // INSERT (genera UID se mancante)
                $supplierUid = $supplierUid !== '' ? $supplierUid : $this->generateSupplierUID();
                $sup['supplier_uid'] = $supplierUid;
                $ok = $this->insertSupplier($sup);
                if ($ok) $report['inserted']++;
                else {
                    $report['rows_invalid']++;
                    $report['errors'][] = ['row'=>$i+1, 'code'=>$supplierUid, 'errors'=>['insert_error']];
                }
            }
        }

        return $report;
    }

    private function supplierExists(string $supplier_uid): bool
    {
        $stmt = $this->conn->prepare("SELECT 1 FROM data_suppliers WHERE company_uid=:c AND supplier_uid=:s LIMIT 1");
        $stmt->execute([
            ':c' => $this->auth->get_userData()['company_uid'],
            ':s' => $supplier_uid,
        ]);
        return (bool)$stmt->fetchColumn();
    }

    private function generateSupplierUID(): string
    {
        // Riusa il tuo helper di authManager, se disponibile
        if (method_exists($this->auth, 'generateUniqueUID')) {
            return $this->auth->generateUniqueUID('data_suppliers', 'supplier_uid', 8);
        }
        // fallback semplice
        return strtoupper(bin2hex(random_bytes(4)));
    }

    private function insertSupplier(array $sup): bool
    {
        $fields = [
            'company_uid'  => $this->auth->get_userData()['company_uid'],
            'supplier_uid' => $sup['supplier_uid'],
            'company_name' => $sup['company_name'] ?? null,
            'cf'           => $sup['cf'] ?? null,
            'piva'         => $sup['piva'] ?? null,
            'indirizzo'    => $sup['indirizzo'] ?? null,
            'cap'          => $sup['cap'] ?? null,
            'city'        => $sup['city'] ?? null,
            'province'     => $sup['province'] ?? null,
            'region'       => $sup['region'] ?? null,
            'state'        => $sup['state'] ?? null,
            'note'         => $sup['note'] ?? null,
            'ref_name'     => $sup['ref_name'] ?? null,
            'ref_phone'    => $sup['ref_phone'] ?? null,
            'ref_fax'      => $sup['ref_fax'] ?? null,
            'ref_email'    => $sup['ref_email'] ?? null,
            'ref_pec'      => $sup['ref_pec'] ?? null,
        ];

        $cols = implode(', ', array_map(fn($k)=>"`$k`", array_keys($fields)));
        $phs  = implode(', ', array_map(fn($k)=>":$k", array_keys($fields)));
        $sql  = "INSERT INTO data_suppliers ($cols) VALUES ($phs)";
        $stmt = $this->conn->prepare($sql);
        foreach ($fields as $k=>$v) $stmt->bindValue(":$k", $v);
        return $stmt->execute();
    }

    private function updateSupplier(string $supplier_uid, array $sup): bool
    {
        // aggiorna SOLO i campi noti (no company_uid, supplier_uid)
        $updatable = array_intersect_key($sup, array_flip([
            'company_name','cf','piva','indirizzo','cap','city','province','region','state',
            'note','ref_name','ref_phone','ref_fax','ref_email','ref_pec'
        ]));
        if (!$updatable) return true; // niente da aggiornare

        $set = [];
        foreach ($updatable as $k=>$v) $set[] = "`$k`=:$k";

        $sql = "UPDATE data_suppliers SET ".implode(', ',$set)."
                WHERE company_uid=:c AND supplier_uid=:s";
        $stmt = $this->conn->prepare($sql);
        foreach ($updatable as $k=>$v) $stmt->bindValue(":$k",$v);
        $stmt->bindValue(':c', $this->auth->get_userData()['company_uid']);
        $stmt->bindValue(':s', $supplier_uid);
        return $stmt->execute();
    }

    private function findHeaderByNorm(array $headers, string $normNeedle): ?string
    {
        foreach ($headers as $h) {
            if ($this->sanitizeHeader($h) === $normNeedle) return $h;
        }
        return null;
    }

    private function fail(string $message, string $error): array
    {
        return ['success' => false, 'message' => $message, 'error' => $error];
    }
}
