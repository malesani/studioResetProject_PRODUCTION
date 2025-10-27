<?php

require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/authManager.php");
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/permsManager.php");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class conceptsObj
{
    protected authManager $authManager;
    protected permsManager $permsManager;
    protected PDO         $conn;
    protected array       $user_data;
    protected string      $company_uid;

    private string $project_uid;
    private array $concept_data;

    public function __construct(authManager $authManager, permsManager $permsManager, string $project_uid)
    {
        $this->authManager  = $authManager;
        $this->permsManager = $permsManager;
        $this->conn         = $this->authManager->get_dbConn();

        $this->user_data    = $this->authManager->get_userData();
        $this->company_uid  = $this->user_data['company_uid'];

        $this->project_uid = $project_uid;

        try {
            $this->concept_data = $this->load_conceptsData();
        } catch (Exception $e) {
            $this->concept_data = [];
        }
    }

    private function load_conceptsData()
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM prjPlanning_concepts 
            WHERE company_uid = :company_uid AND project_uid = :project_uid
        ");
        $stmt->execute(["company_uid" => $this->company_uid, "project_uid" => $this->project_uid]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            return $row;
        } else {
            throw new Exception("No concepts record found");
        }
    }

    public function set_conceptData(array $list_concept_uid): array
    {
        // 1) validazione: deve essere un array e TUTTI gli elementi devono essere stringhe
        if (count($list_concept_uid) !== count(array_filter($list_concept_uid, 'is_string'))) {
            return [
                'success' => false,
                'message' => 'conceptData.invalidDataFormat',
                'error'   => 'conceptData format is not an array of strings',
            ];
        }

        try {
            // prepariamo i parametri
            $params = [
                'company_uid'       => $this->company_uid,
                'project_uid'       => $this->project_uid,
                // se la colonna è di tipo JSON, puoi fare json_encode; altrimenti 
                // adatta a come la vuoi salvare (es. implode(',',$newconceptData))
                'list_concept_uid' => json_encode($list_concept_uid),
            ];

            // 2) INSERT o UPDATE in caso di chiave duplicata
            $sql = "INSERT INTO prjPlanning_concepts (company_uid, project_uid, list_concept_uid)
                VALUES (:company_uid, :project_uid, :list_concept_uid)
                    ON DUPLICATE KEY UPDATE list_concept_uid = VALUES(list_concept_uid)";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            return [
                'success' => true,
                'message' => 'conceptData.infoUpserted'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'conceptData.fatalError',
                'error'   => $e->getMessage()
            ];
        }
    }


    // GETTERS
    public function get_conceptData()
    {
        return $this->concept_data;
    }
}
