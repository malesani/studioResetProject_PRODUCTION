<?php

require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/authManager.php");
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/permsManager.php");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class inspirationsObj
{
    protected authManager $authManager;
    protected permsManager $permsManager;
    protected PDO         $conn;
    protected array       $user_data;
    protected string      $company_uid;

    private string $project_uid;
    private array $answers_data;

    public function __construct(authManager $authManager, permsManager $permsManager, string $project_uid)
    {
        $this->authManager  = $authManager;
        $this->permsManager = $permsManager;
        $this->conn         = $this->authManager->get_dbConn();

        $this->user_data    = $this->authManager->get_userData();
        $this->company_uid  = $this->user_data['company_uid'];

        $this->project_uid = $project_uid;

        try {
            $this->answers_data = $this->load_answersData();
        } catch (Exception $e) {
            $this->answers_data = [];
        }
    }

    private function load_answersData()
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM prjPlanning_inspirationsAnswers
            WHERE company_uid = :company_uid AND project_uid = :project_uid
        ");
        $stmt->execute(["company_uid" => $this->company_uid, "project_uid" => $this->project_uid]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $answers_data = [];
        foreach ($rows as $row) {
            $answers_data[$row['question_uid']] = $row['answer_uid'];
        }

        return $answers_data;
    }

    public function set_answerData(string $question_uid, string $answer_uid): array
    {
        try {
            // prepariamo i parametri
            $params = [
                'company_uid'       => $this->company_uid,
                'project_uid'       => $this->project_uid,
                'question_uid'      => $question_uid,
                'answer_uid'      => $answer_uid,
            ];

            // 2) INSERT o UPDATE in caso di chiave duplicata
            $sql = "INSERT INTO prjPlanning_inspirationsAnswers (company_uid, project_uid, question_uid, answer_uid)
                VALUES (:company_uid, :project_uid, :question_uid, :answer_uid)
                    ON DUPLICATE KEY UPDATE answer_uid = VALUES(answer_uid), updated_at = NOW() ";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            $this->answers_data[$question_uid] = $answer_uid;

            return [
                'success' => true,
                'message' => 'answerData.infoUpserted'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'answerData.fatalError',
                'error'   => $e->getMessage()
            ];
        }
    }


    // GETTERS
    public function get_answersData()
    {
        return $this->answers_data;
    }

    public function get_answerUid(string $question_uid)
    {
        if (!empty($this->answers_data[$question_uid])) {
            return $this->answers_data[$question_uid];
        } else {
            return null;
        }
    }
}
