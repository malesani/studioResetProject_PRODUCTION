<?php

require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/authManager.php");
require_once("{$_SERVER['DOCUMENT_ROOT']}/auth/obj/permsManager.php");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class objectivesObj
{
    protected authManager $authManager;
    protected permsManager $permsManager;
    protected PDO         $conn;
    protected array       $user_data;
    protected string      $company_uid;

    private string $project_uid;
    private array $objective_data;

    public function __construct(authManager $authManager, permsManager $permsManager, string $project_uid)
    {
        $this->authManager  = $authManager;
        $this->permsManager = $permsManager;
        $this->conn         = $this->authManager->get_dbConn();

        $this->user_data    = $this->authManager->get_userData();
        $this->company_uid  = $this->user_data['company_uid'];

        $this->project_uid = $project_uid;

        try {
            $this->objective_data = $this->load_objectivesData();
        } catch (Exception $e) {
            $this->objective_data = [];
        }
    }

    private function load_objectivesData()
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM prjPlanning_objectives 
            WHERE company_uid = :company_uid AND project_uid = :project_uid
        ");
        $stmt->execute(["company_uid" => $this->company_uid, "project_uid" => $this->project_uid]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            return $row;
        } else {
            throw new Exception("No objectives record found");
        }
    }

    public function set_objectiveData(array $list_objective_uid): array
    {
        // 1) validazione: deve essere un array e TUTTI gli elementi devono essere stringhe
        if (count($list_objective_uid) !== count(array_filter($list_objective_uid, 'is_string'))) {
            return [
                'success' => false,
                'message' => 'objectiveData.invalidDataFormat',
                'error'   => 'objectiveData format is not an array of strings',
            ];
        }

        try {
            // prepariamo i parametri
            $params = [
                'company_uid'       => $this->company_uid,
                'project_uid'       => $this->project_uid,
                // se la colonna è di tipo JSON, puoi fare json_encode; altrimenti 
                // adatta a come la vuoi salvare (es. implode(',',$newObjectiveData))
                'list_objective_uid' => json_encode($list_objective_uid),
            ];

            // 2) INSERT o UPDATE in caso di chiave duplicata
            $sql = "INSERT INTO prjPlanning_objectives (company_uid, project_uid, list_objective_uid)
                VALUES (:company_uid, :project_uid, :list_objective_uid)
                    ON DUPLICATE KEY UPDATE list_objective_uid = VALUES(list_objective_uid)";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            return [
                'success' => true,
                'message' => 'objectiveData.infoUpserted'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'objectiveData.fatalError',
                'error'   => $e->getMessage()
            ];
        }
    }


    // GETTERS
    public function get_objectiveData()
    {
        return $this->objective_data;
    }
}
