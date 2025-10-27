<?php

declare(strict_types=1);

use Shuchkin\SimpleXLSX;

$srcPath = $_SERVER['DOCUMENT_ROOT'] ?: '/var/www/html';

// Inclusioni standard di progetto
require_once "$srcPath/auth/inclusions.php";
require_once "$srcPath/general_inclusions.php";

// Obj prodotto (percorsi corretti)
require_once "$srcPath/products/obj/productsObj.php";

class ProductsImportService
{
    private authManager $auth;
    private permsManager $perms;
    private PDO $conn;

    /** Campi noti della tabella prodotti (allineati a productObjBase::ALL_FIELDS) */
    private array $knownFields = [
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
        'suppl_note'
    ];

    /** Alias generici → campo reale */
    private array $aliases = [
        'codice'          => 'art_code',
        'articolo'        => 'art_code',
        'artcode'         => 'art_code',
        'codice articolo' => 'art_code',

        'nome'            => 'name',
        'descrizione'     => 'description',

        'u.m.'            => 'um',
        'um'              => 'um',
        'unità'           => 'um',
        'unita'           => 'um',

        'categoria'       => 'category',
        'sottocategoria'  => 'subCategory',

        'prezzo'          => 'selling_price',
        'prezzo vendita'  => 'selling_price',
        'costo'           => 'purchase_price',
        'noleggio'        => 'rental_price',

        'base'            => 'dim_X',
        'larghezza'       => 'dim_X',
        'profondita'      => 'dim_Y',
        'profondità'      => 'dim_Y',
        'altezza'         => 'dim_Z',

        'peso'            => 'weigth',
        'udm'             => 'um_dim',
        'um_dim'          => 'um_dim',
        'um_weigth'       => 'um_weigth',

        'fornitore'       => 'suppl_name',
        'cod fornitore'   => 'suppl_code',
        'codice fornitore' => 'suppl_code',
        'cod art fornitore' => 'suppl_artCode',
        'note fornitore'  => 'suppl_note',
        'classe provvigione' => 'commission_class',
    ];

    /**
     * Mappa dedicata agli header italiani forniti (dopo normalizzazione).
     * Chiave = header normalizzato, Valore = campo tabella di destinazione.
     *
     * NB: per i listini/prezzi usiamo priorità in simulateOrCommit.
     */
    private array $itHeaderMap = [
        // Identificativi e descrizioni
        'cod'                    => 'art_code',
        'descrizione'            => 'name',          // preferiamo "name"; se vuoi mettere in description cambia qui
        'tipologia'              => 'type',
        'categoria'              => 'category',
        'sottocategoria'         => 'subCategory',

        // Unità di misura e IVA
        'cod udm'                => 'um',
        'cod iva'                => 'tax_val',

        // Prezzi listino (vendita): noi useremo Listino 1 come selling_price
        'listino 1'              => '__listino_1',   // placeholder interno
        'listino 2'              => '__listino_2',
        'listino 3'              => '__listino_3',
        'listino 4'              => '__listino_4',
        'listino 5'              => '__listino_5',
        'listino 6'              => '__listino_6',
        'listino 8'              => '__listino_8',
        'listino 9'              => '__listino_9',

        'formula listino 1'      => '__formula_l1',
        'formula listino 2'      => '__formula_l2',
        'formula listino 3'      => '__formula_l3',
        'formula listino 4'      => '__formula_l4',
        'formula listino 5'      => '__formula_l5',
        'formula listino 6'      => '__formula_l6',
        'formula listino 8'      => '__formula_l8',
        'formula listino 9'      => '__formula_l9',

        // Note & barcode
        'note'                   => 'description',   // se vuoi tenerle altrove, cambia
        'cod a barre'            => null,           // ignorato (o mappa a un tuo campo extra)

        // Provvigioni & web
        'classe provvigione'     => 'commission_class',
        'internet'               => null,

        // Fornitore
        'produttore'             => null,           // o 'suppl_name' se lo vuoi come fornitore di default
        'extra 1'                => null,
        'extra 2'                => null,
        'extra 3'                => null,
        'extra 4'                => null,

        'cod fornitore'          => 'suppl_code',
        'fornitore'              => 'suppl_name',
        'cod prod forn'          => 'suppl_artCode',
        'prezzo forn'            => '__prezzo_forn', // per priority purchase_price
        'note fornitura'         => 'suppl_note',

        // Logistica / magazzino (ignoriamo in questo import base)
        'ord a multipli di'      => null,
        'gg ordine'              => null,
        'scorta min'             => null,
        'ubicazione'             => null,
        'tot qta caricata'       => null,
        'tot qta scaricata'      => null,
        'qta giacenza'           => null,
        'qta impegnata'          => null,
        'qta disponibile'        => null,
        'qta in arrivo'          => null,
        'vendita media mensile'  => null,
        'stima data fine magazz' => null,
        'stima data prossimo ordine' => null,
        'data primo carico'      => null,
        'data ultimo carico'     => null,
        'data ultimo scarico'    => null,

        // Costi (priority per purchase_price)
        "costo medio d'acq"      => '__costo_medio_acq',
        "ultimo costo d'acq"     => '__ultimo_costo_acq',
        'prezzo medio vend'      => null,
        'stato magazzino'        => null,

        // Dimensioni e pesi
        'udm dim'                => 'um_dim',
        'dim netta x'            => null,
        'dim netta y'            => null,
        'dim netta z'            => null,
        'volume netto'           => null,
        'dim imballo x'          => 'dim_X',
        'dim imballo y'          => 'dim_Y',
        'dim imballo z'          => 'dim_Z',
        'volume imballo'         => null,
        'udm peso'               => 'um_weigth',
        'peso netto'             => 'weigth',       // prendiamo netto come peso prodotto
        'peso lordo'             => null,
        'immagine'               => null,
    ];

    public function __construct(authManager $auth, permsManager $perms)
    {
        $this->auth  = $auth;
        $this->perms = $perms;
        $this->conn  = $auth->get_dbConn();
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    /**
     * Upload: accetta CSV/TXT/XLSX, normalizza e crea un job con headers/mapping/preview.
     * @param array  $file       $_FILES['file']
     * @param string $delimiter  ';' | ',' | "\t" | 'auto'
     * @param bool   $hasHeader
     * @param string $encoding   'UTF-8' | 'ISO-8859-1' | ...
     */
    public function handleUpload(array $file, string $delimiter, bool $hasHeader, string $encoding): array
    {
        if (empty($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return $this->fail('imports.upload.missingFile', 'Missing uploaded file or upload error');
        }

        $tmpPath  = $file['tmp_name'];
        $origName = $file['name'] ?? 'upload.bin';
        $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        try {
            // 1) Leggo righe
            if ($ext === 'xlsx') {
                $rows = $this->readXlsxAsRows($tmpPath);
            } elseif ($ext === 'csv' || $ext === 'txt') {
                $text = $this->readFileAsText($tmpPath, $encoding);
                if ($delimiter === '' || $delimiter === 'auto') {
                    $delimiter = $this->detectDelimiter($text) ?? ';';
                }
                $rows = $this->readCsvTextToRows($text, $delimiter);
            } else {
                // fallback: prova come testo (CSV) se l’utente ha rinominato a caso
                $text = $this->readFileAsText($tmpPath, $encoding);
                if ($delimiter === '' || $delimiter === 'auto') {
                    $delimiter = $this->detectDelimiter($text) ?? ';';
                }
                $rows = $this->readCsvTextToRows($text, $delimiter);
            }
        } catch (Throwable $e) {
            return $this->fail('imports.upload.parseError', $e->getMessage());
        }

        if (empty($rows)) {
            return $this->fail('imports.upload.emptyFile', 'No rows detected');
        }

        // 2) Header + Preview
        $headers = $hasHeader ? array_shift($rows) : $this->buildFakeHeaders(count($rows[0] ?? []));
        $headers = array_map([$this, 'sanitizeHeader'], $headers);

        // Garantisci che le righe abbiano la stessa lunghezza dell’header
        $colNum = count($headers);
        $normalizedRows = [];
        foreach ($rows as $r) {
            if (!is_array($r)) $r = [];
            $r = array_values($r);
            if (count($r) < $colNum) {
                $r = array_pad($r, $colNum, '');
            } elseif (count($r) > $colNum) {
                $r = array_slice($r, 0, $colNum);
            }
            $normalizedRows[] = array_map([$this, 'normalizeCell'], $r);
        }
        $rows = $normalizedRows;

        // Salva sia preview che tutte le righe
        $PREVIEW_LIMIT = 20;
        $preview = array_slice($rows, 0, $PREVIEW_LIMIT);
        // 3) Mapping auto (prima specifico italiano, poi fallback generico, poi null)
        $mapping = $this->buildAutoMapping($headers);

        // salva tutte le righe normalizzate
        $jobId = $this->createJob($delimiter, $hasHeader, 'UTF-8', $headers, $mapping, $preview, $rows);

        return [
            'success' => true,
            'message' => 'imports.upload.ok',
            'data'    => [
                'job_id'  => $jobId,
                'headers' => $headers,
                'mapping' => $mapping,
                'preview' => $preview
            ]
        ];
    }

    /**
     * Run: esecuzione simulata o commit, partendo dal job salvato + mapping dal client.
     */
    public function handleRun(array $payload): array
    {
        $jobId     = (string)($payload['job_id'] ?? '');
        $dryRun    = (bool)($payload['dry_run'] ?? true);

        if ($jobId === '') {
            return $this->fail('imports.run.missingJob', 'job_id is required');
        }

        // mapping dal payload o dal job
        $mapping = $payload['mapping'] ?? $this->loadMappingFromJob($jobId);
        if (empty($mapping) || (!is_array($mapping) && !is_object($mapping))) {
            $mapping = new stdClass(); // {}
        }

        // Carica dati grezzi salvati nel job (headers + preview)
        [$headers, $rows] = $this->loadRowsFromJob($jobId);
        if (empty($headers)) {
            return $this->fail('imports.run.noHeaders', 'Job headers missing');
        }

        // Applica mapping e valida
        $report = $this->simulateOrCommit($headers, $rows, (array)$mapping, $dryRun);

        return [
            'success' => true,
            'message' => $dryRun ? 'imports.run.dry_ok' : 'imports.run.commit_ok',
            'data'    => [
                'job_id' => $jobId,
                'report' => $report
            ]
        ];
    }

    /* ===================== Helpers parsing ===================== */

    /** XLSX → array di righe (UTF-8) usando SimpleXLSX */
    private function readXlsxAsRows(string $filePath): array
    {
        if (!class_exists(SimpleXLSX::class)) {
            throw new RuntimeException('Libreria SimpleXLSX non installata: composer require shuchkin/simplexlsx');
        }
        $xlsx = SimpleXLSX::parse($filePath);
        if (!$xlsx) {
            throw new RuntimeException('Errore lettura XLSX: ' . SimpleXLSX::parseError());
        }
        $rows = [];
        foreach ($xlsx->rows() as $row) {
            $rows[] = array_map([$this, 'normalizeCell'], $row);
        }
        return $rows;
    }

    /** Leggi file di testo e normalizza a UTF-8 (rimuove BOM) */
    private function readFileAsText(string $path, string $encoding = 'UTF-8'): string
    {
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new RuntimeException('Cannot read uploaded file');
        }

        // Converti → UTF-8
        $encs = [$encoding, 'UTF-8', 'ISO-8859-1', 'Windows-1252'];
        $det  = mb_detect_encoding($raw, implode(',', $encs), true) ?: $encoding;
        $txt  = ($det === 'UTF-8') ? $raw : mb_convert_encoding($raw, 'UTF-8', $det);

        // Rimuovi BOM
        if (strncmp($txt, "\xEF\xBB\xBF", 3) === 0) {
            $txt = substr($txt, 3);
        }
        return $txt;
    }

    /** Heuristica per individuare il delimitatore dal primo record */
    private function detectDelimiter(string $text): ?string
    {
        $firstLine = strtok($text, "\r\n");
        if ($firstLine === false) return null;
        $cands = [';', ',', "\t", '|'];
        $best = null;
        $bestCount = -1;
        foreach ($cands as $d) {
            $count = substr_count($firstLine, $d);
            if ($count > $bestCount) {
                $best = $d;
                $bestCount = $count;
            }
        }
        return $best;
    }

    /** CSV testo → righe (array di array) */
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
        $s = str_replace("\x00", '', $s);                  // NUL
        $s = preg_replace('/[[:cntrl:]]/u', '', $s);       // control chars
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
        // normalizza: rimuovo punti, converto accenti, compattazione spazi, lower
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

    /** Auto-mapping header → campo reale o null (preferisce mappa italiana, poi alias generici, poi null) */
    private function buildAutoMapping(array $headers): array
    {
        $mapping = [];
        foreach ($headers as $originalH) {
            $norm = $this->sanitizeHeader($originalH);
            if (array_key_exists($norm, $this->itHeaderMap)) {
                $to = $this->itHeaderMap[$norm];
                $mapping[$originalH] = $to; // può essere null (ignorato) o placeholder __xxx
                continue;
            }

            // fallback: se già ricordato come campo noto
            if (in_array($originalH, $this->knownFields, true)) {
                $mapping[$originalH] = $originalH;
                continue;
            }

            // fallback alias generico
            $low = mb_strtolower($originalH);
            if (isset($this->aliases[$low])) {
                $mapping[$originalH] = $this->aliases[$low];
                continue;
            }

            // se niente match → null
            $mapping[$originalH] = null;
        }
        return $mapping;
    }

    /* ================== Job storage (JSON in tabella) ================== */

    private function createJob(
        string $delimiter,
        bool $hasHeader,
        string $encoding,
        array $headers,
        array $mapping,
        array $preview,
        array $allRows      // 👈 nuovo parametro
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

    /** Recupero headers e preview salvati nel job */
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
        // preferisci rows_json, se assente usa preview_json
        $rows = json_decode((string)($row['rows_json'] ?? '[]'), true);
        if (!is_array($rows) || empty($rows)) {
            $rows = json_decode((string)($row['preview_json'] ?? '[]'), true) ?: [];
        }

        return [$headers, $rows];
    }


    /** Simula/commit applicando mapping a ciascuna riga */
    private function simulateOrCommit(array $headers, array $rows, array $mapping, bool $dryRun): array
    {
        $idxOf = array_flip($headers); // header → indice colonna

        $report = [
            'rows_total'   => count($rows),
            'rows_invalid' => 0,
            'inserted'     => 0,
            'updated'      => 0,
            'skipped'      => 0,
            'errors'       => [],
        ];

        // Prepara liste di header per priorità prezzi (reading diretto se il mapping usa i placeholder __xxx)
        $hListino1 = $this->findHeaderByNorm($headers, 'listino 1');
        $hPrezzoF  = $this->findHeaderByNorm($headers, 'prezzo forn');
        $hUltCosto = $this->findHeaderByNorm($headers, "ultimo costo d'acq");
        $hCostoMed = $this->findHeaderByNorm($headers, "costo medio d'acq");

        foreach ($rows as $i => $row) {
            // costruisci record prodotto applicando il mapping
            $prod = [];
            foreach ($mapping as $fromHeader => $toField) {
                if (!$toField) continue;

                // I placeholder __xxx NON vanno copiati direttamente: servono dopo per priorità prezzi.
                if (is_string($toField) && str_starts_with($toField, '__')) {
                    continue;
                }

                $col = $idxOf[$fromHeader] ?? null;
                $val = ($col !== null && array_key_exists($col, $row)) ? $row[$col] : null;

                // cast “soft” numeri
                if (in_array($toField, ['purchase_price', 'selling_price', 'rental_price', 'dim_X', 'dim_Y', 'dim_Z', 'weigth', 'tax_val'], true)) {
                    $val = $this->toNumber($val);
                }
                $prod[$toField] = $val;
            }

            // PRIORITÀ PREZZI
            // selling_price: usa Listino 1 se disponibile (override solo se non già impostato)
            if (!isset($prod['selling_price']) && $hListino1 !== null) {
                $col = $idxOf[$hListino1];
                $v = $this->toNumber($row[$col] ?? null);
                if ($v !== null) $prod['selling_price'] = $v;
            }

            // purchase_price: prezzo fornitore > ultimo costo d'acq. > costo medio d'acq.
            if (!isset($prod['purchase_price'])) {
                $v = null;
                if ($hPrezzoF !== null) {
                    $v = $this->toNumber($row[$idxOf[$hPrezzoF]] ?? null);
                }
                if ($v === null && $hUltCosto !== null) {
                    $v = $this->toNumber($row[$idxOf[$hUltCosto]] ?? null);
                }
                if ($v === null && $hCostoMed !== null) {
                    $v = $this->toNumber($row[$idxOf[$hCostoMed]] ?? null);
                }
                if ($v !== null) $prod['purchase_price'] = $v;
            }

            // validazioni minime
            $art  = trim((string)($prod['art_code'] ?? ''));
            $name = trim((string)($prod['name'] ?? ''));
            if ($art === '' || $name === '') {
                $report['rows_invalid']++;
                $report['errors'][] = [
                    'row'      => $i + 1,
                    'art_code' => $art ?: null,
                    'errors'   => ['art_code and name are required']
                ];
                continue;
            }

            if ($dryRun) {
                $exists = $this->productExists($art);
                $exists ? $report['updated']++ : $report['inserted']++;
            } else {
                // Usa productObj per rispettare le tue regole di business
                $exists = $this->productExists($art);

                if ($exists) {
                    $obj    = new productObj($this->auth, $this->perms, $art);
                    $result = $obj->set_productInfo($prod);
                    if ($result['success']) $report['updated']++;
                    else {
                        $report['rows_invalid']++;
                        $report['errors'][] = [
                            'row'      => $i + 1,
                            'art_code' => $art,
                            'errors'   => [$result['error'] ?? 'update_error']
                        ];
                    }
                } else {
                    $obj = new productObj($this->auth, $this->perms, null);
                    // garantisci i required
                    $prod['art_code'] = $art;
                    $prod['name']     = $name;
                    $result = $obj->insert_productInfo($prod);
                    if ($result['success']) $report['inserted']++;
                    else {
                        $report['rows_invalid']++;
                        $report['errors'][] = [
                            'row'      => $i + 1,
                            'art_code' => $art,
                            'errors'   => [$result['error'] ?? 'insert_error']
                        ];
                    }
                }
            }
        }

        return $report;
    }

    private function productExists(string $art_code): bool
    {
        $stmt = $this->conn->prepare("SELECT 1 FROM data_products WHERE company_uid=:c AND art_code=:a LIMIT 1");
        $stmt->execute([
            ':c' => $this->auth->get_userData()['company_uid'],
            ':a' => $art_code
        ]);
        return (bool)$stmt->fetchColumn();
    }

    private function toNumber($v): ?float
    {
        if ($v === null) return null;
        $s = trim((string)$v);
        if ($s === '') return null;

        // Normalizza formati EU: "1.234,56" → "1234.56"
        $s = str_replace(["\xC2\xA0", ' '], '', $s); // NBSP & space
        // se contiene sia '.' che ',', assume '.'=thousand ','=decimal
        if (str_contains($s, '.') && str_contains($s, ',')) {
            $s = str_replace('.', '', $s);
            $s = str_replace(',', '.', $s);
        } else {
            // se ha solo ',', usala come decimale
            if (str_contains($s, ',') && !str_contains($s, '.')) {
                $s = str_replace(',', '.', $s);
            }
        }
        if (!is_numeric($s)) return null;
        return (float)$s;
    }

    /** Trova header originale per un header normalizzato (ritorna la prima corrispondenza) */
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
