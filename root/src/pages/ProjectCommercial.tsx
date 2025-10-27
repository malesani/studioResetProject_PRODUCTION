// src/components/ProjectCommercial.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  MDBRow,
  MDBCol,
  MDBCard
} from 'mdb-react-ui-kit';

import { GeneralForm, FieldConfig, SelectData } from '../app_components/GeneralForm';
import GeneralTable, { ColumnConfig, ActionConfig } from '../app_components/GeneralTable';
import General_Loading from '../app_components/General_Loading';

import { fetchProject, APIProjectInfo } from '../api_module/ProjectRequests';
import { getCustomerB2BInfo, APICustomerB2BInfo } from '../api_module/CustomerB2BRequest';
import {
  getCustomerTeamMembersList,
  APICustTeamMemberInfo
} from '../api_module/CustomerTeamMemberRequest';

import {
  APICommunicationInfo,
  getProjectCommunicationsList,
  createProjectCommunication,
  updateProjectCommunication,
  deleteProjectCommunication
} from '../api_module/ProjectCommunicationRequest';

// Tipologie di contatto gestite in frontend
const CONTACT_TYPE_OPTIONS: SelectData[] = [
  { value: 'email', text: 'Email' },
  { value: 'phone', text: 'Telefonata' },
  { value: 'meeting', text: 'Riunione' },
];

const ProjectCommercial: React.FC = () => {
  const { project_uid } = useParams<{ project_uid: string }>();
  if (!project_uid) {
    return (
      <div className="alert alert-danger">
        UID del progetto mancante in URL!
      </div>
    );
  }

  const [loadingMode, setLoadingMode] = useState(true);
  const [teamMembers, setTeamMembers] = useState<APICustTeamMemberInfo[]>([]);

  // Carico i team member del cliente associato al progetto
  useEffect(() => {
    (async () => {
      setLoadingMode(true);
      try {
        const projRes = await fetchProject({ project_uid });
        if (projRes.data) {
          const custRes = await getCustomerB2BInfo({ customer_uid: projRes.data.customer_uid });
          if (custRes.data) {
            const teamRes = await getCustomerTeamMembersList({ customer_uid: custRes.data.customer_uid });
            if (teamRes.data) {
              setTeamMembers(teamRes.data);
            }
          }
        }
      } finally {
        setLoadingMode(false);
      }
    })();
  }, [project_uid]);

  // Preparo le opzioni per il select "Team Member"
  const teamMemberOptions: SelectData[] = teamMembers.map(m => ({
    value: m.teamMember_uid,
    text: `${m.first_name} ${m.last_name}`
  }));

  // Configurazione dei campi del form di creazione/modifica
  const commFields: FieldConfig<APICommunicationInfo>[] = [
    { name: 'contact_date', label: 'Data Contatto', type: 'date', required: true, grid: { md: 4 } },
    { name: 'contact_type', label: 'Tipologia', type: 'selectbox', options: CONTACT_TYPE_OPTIONS, required: true, grid: { md: 4 } },
    { name: 'teamMember_uid', label: 'Team Member', type: 'selectbox', options: teamMemberOptions, required: false, grid: { md: 4 } },
    { name: 'note', label: 'Nota', type: 'text_area', required: true, grid: { md: 12 } },
  ];

  // Configurazione delle colonne della tabella
  const commColumns: ColumnConfig<APICommunicationInfo>[] = [
    { field: 'contact_date', label: 'Data' },
    { field: 'contact_type', label: 'Tipologia' },
    {
      field: 'teamMember_uid',
      label: 'Team Member',
      computeValue: row => {
        const found = teamMemberOptions.find(o => o.value === row.teamMember_uid);
        return found ? found.text : '-';
      }
    },
    { field: 'note', label: 'Nota' },
  ];

  // SET LOADING
  if (loadingMode) {
    return (<General_Loading theme="pageLoading" title='Comunicazioni Progetto' />);
  }

  return (
    <MDBCard className="p-4">
      <GeneralTable<APICommunicationInfo, { project_uid: string }>
        title="Comunicazioni Progetto"
        icon="comment-dots"
        getData={getProjectCommunicationsList}
        createData={createProjectCommunication}
        updateData={updateProjectCommunication}
        deleteData={deleteProjectCommunication}
        columns={commColumns}
        fields={commFields}
        rowKey="communication_uid"
        params={{ project_uid }}
        enableCreate={true}
      />
    </MDBCard>
  );
};

export default ProjectCommercial;
