<?php
declare(strict_types=1);

class CSVReader
{
    public function __construct(
        private string $path,
        private string $delimiter = ';',
        private bool $hasHeader = true,
        private string $encoding = 'UTF-8'
    ) {}

    public function preview(int $limit = 20): array
    {
        [$headers, $rows] = $this->read($limit);
        return ['headers' => $headers, 'rows' => $rows];
    }

    /**
     * @return array{0: string[], 1: array<int, array<int, string>>}
     */
    public function read(?int $limit = null): array
    {
        $fh = fopen($this->path, 'r');
        if (!$fh) throw new Exception("Cannot open CSV file");

        $headers = [];
        $rows = [];
        $line = 0;

        if ($this->hasHeader) {
            $headers = $this->normalizeRow(fgets($fh) === false ? [] : str_getcsv($this->readLine($fh), $this->delimiter));
            if (!$headers) {
                // fallback: leggi prima riga utile con fgetcsv
                rewind($fh);
                $headers = $this->normalizeRow(fgetcsv($fh, 0, $this->delimiter) ?: []);
            }
        }

        if (!$this->hasHeader) {
            // leggi prima riga e deduci numero di colonne
            $first = fgetcsv($fh, 0, $this->delimiter) ?: [];
            $cols  = count($first);
            $headers = array_map(fn($i) => "col_$i", range(1, $cols));
            $rows[] = $this->normalizeRow($first);
            $line++;
        }

        while (($row = fgetcsv($fh, 0, $this->delimiter)) !== false) {
            $rows[] = $this->normalizeRow($row);
            $line++;
            if ($limit !== null && $line >= $limit) break;
        }
        fclose($fh);
        return [$headers, $rows];
    }

    private function readLine($fh): string
    {
        $line = fgets($fh);
        if ($line === false) return '';
        // converti encoding se necessario
        return $this->encoding === 'UTF-8' ? $line : mb_convert_encoding($line, 'UTF-8', $this->encoding);
    }

    private function normalizeRow(array $row): array
    {
        return array_map(function($s) {
            $s = is_string($s) ? trim($s) : $s;
            return $s;
        }, $row);
    }
}
