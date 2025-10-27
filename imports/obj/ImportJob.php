<?php
declare(strict_types=1);

require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/authManager.php");
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/permsManager.php");

class ImportJob
{
    public function __construct(
        private authManager $authManager,
        private permsManager $permsManager
    ) {}

    public function createJob(PDO $conn, string $type, string $filename): string
    {
        $company_uid = $this->authManager->get_userData()['company_uid'];
        $job_id = $this->uuid();

        $stmt = $conn->prepare("INSERT INTO data_import_jobs
            (id, company_uid, type, status, filename)
            VALUES (:id,:company_uid,:type,'uploaded',:filename)");
        $stmt->execute([
            ':id'          => $job_id,
            ':company_uid' => $company_uid,
            ':type'        => $type,
            ':filename'    => $filename
        ]);

        return $job_id;
    }

    public function updateJob(PDO $conn, string $job_id, array $data): void
    {
        if (!$data) return;
        $sets = [];
        $params = [':id' => $job_id];
        foreach ($data as $k => $v) {
            $col = match($k) {
                'status','filename','mapping_json','report_json' => $k,
                'rows_total','rows_valid','rows_invalid','inserted','updated','skipped' => $k,
                default => $k
            };
            $sets[] = "`$col` = :$col";
            $params[":$col"] = is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : $v;
        }
        $sql = "UPDATE data_import_jobs SET " . implode(', ', $sets) . " WHERE id=:id";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
    }

    public function getJob(PDO $conn, string $job_id): ?array
    {
        $stmt = $conn->prepare("SELECT * FROM data_import_jobs WHERE id=:id LIMIT 1");
        $stmt->execute([':id' => $job_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function ensureStorage(string $company_uid, string $job_id): string
    {
        $base = $_SERVER['DOCUMENT_ROOT'] . "/storage/imports/" . $company_uid . "/" . $job_id;
        if (!is_dir($base)) {
            @mkdir($base, 0775, true);
        }
        return $base;
    }

    private function uuid(): string
    {
        // semplice UUID v4 compatibile
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
