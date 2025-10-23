import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { MDBCard } from 'mdb-react-ui-kit';
import { DataResponse } from '../hooks/RequestFunction';

import { FieldConfig } from "../app_components/GeneralForm";
import GeneralTable, { ColumnConfig, ActionConfig } from "../app_components/GeneralTable";
import General_Loading from '../app_components/General_Loading';

import { fetchProjectRequests, createProjectRequest, APIProjectInfo } from '../api_module/ProjectRequests';
import { APICustomerB2BInfo, getCustomerB2BList } from '../api_module/CustomerB2BRequest';

const ProjectsRequest: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<APICustomerB2BInfo[]>([]);
  const [loadingMode, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // evita setState su componente smontato

    async function fetchCustomers() {
      setLoading(true);
      setError(null);
      try {
        // qui passi eventuali filtri: search, city, province, page, per_page
        const args = { search: '', page: 1, per_page: 20 };
        const { response, data } = await getCustomerB2BList(args);

        if (response.success && data) {
          if (isMounted) {
            setCustomers(data.customers_list);
            console.log('customers', data.customers_list);
          }
        } else {
          console.error('Fetch fallito:', response.message);
          if (isMounted) setError(response.message || 'Errore generico');
        }
      } catch (err: any) {
        console.error('Errore nella richiesta:', err);
        if (isMounted) setError(err.message || 'Errore di rete');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, []); // esegue una volta dopo il mount

  const customersOptions = customers.map(customer => ({
    value: customer.customer_uid,
    text: customer.business_name,
  }));

  const projectFields: FieldConfig<APIProjectInfo>[] = [
    { name: "customer_uid", label: "Cliente", required: true, type: "selectbox", options: customersOptions, grid: { md: 4 } },
    { name: "title", label: "Titolo Progetto", required: true, grid: { md: 8 } },
    { name: "start_date", label: "Data Inizio", required: true, type: "date", grid: { md: 6 } },
    { name: "end_date", label: "Data Fine", required: true, type: "date", grid: { md: 6 } },
    { name: "location", label: "Location", required: false, grid: { md: 12 } },
    { name: "stand", label: "Padiglione", required: false, grid: { md: 5 } },
    { name: "stand", label: "Posteggio", required: false, grid: { md: 5 } },
    { name: "stand", label: "Showroom", required: false, type: "checkbox", grid: { md: 2 } },
  ];

  if (error) return <div className="text-danger">Errore: {error}</div>;

  // SET LOADING
  if (loadingMode) {
    return (<General_Loading theme="pageLoading" title='Nuova Richiesta Progetto' />);
  }

  // wrapper per GeneralTable: trasforma DataResponse<ProjectListData>
  // in DataResponse<APIProjectInfo[]>
  const fetchProjectRows = async (args: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<DataResponse<APIProjectInfo[]>> => {
    const { search = "", page = 1, per_page = 20 } = args;

    try {
      // fetchProjects ritorna DataResponse<ProjectListData>
      const { response, data } = await fetchProjectRequests({ search, page, per_page });
      if (response.success && data) {
        return {
          response,
          data: data.projects_list
        };
      } else {
        throw new Error(response.error || response.message || 'Failed to load projects');
      }
    } catch (err: any) {
      return {
        response: {
          success: false,
          message: err.message || "Unknown error",
          error: err.message || "Unknown error"
        }
      };
    }
  };

  // colonne per la tabella progetti
  const columns: ColumnConfig<APIProjectInfo>[] = [
    { field: 'client_name', label: 'Cliente' },
    { field: 'title', label: 'Evento' },
    { field: 'location', label: 'Location' },
    { field: 'start_date', label: 'Data Inizio' },
    { field: 'end_date', label: 'Data Fine' },
    { field: 'stand', label: 'Stand' }
  ];

  // se hai campi di ricerca/paginazione extra, definisci qui, altrimenti []
  const fields = [] as any[];

  // azioni su ogni riga: ad es. vai al cruscotto del progetto
  const actions: ActionConfig<APIProjectInfo>[] = [
    {
      icon: 'folder-open',
      buttonProps: { color: 'primary' },
      onClick: (proj) =>
        navigate(`/management/project_commercial/${encodeURIComponent(proj.project_uid)}`)
    }
  ];

  return (
    <>
      <MDBCard className="p-4">
        <GeneralTable<APIProjectInfo, {}, {}>
          title="Lista Richieste di progetto"
          icon="hourglass-half"
          columns={columns}
          fields={projectFields}
          getData={fetchProjectRows}
          createData={createProjectRequest}
          initialFilters={{ page: 1, per_page: 20 }}
          disableNotVisible={{ create: false, update: false, delete: false }}
          actions={actions}
        />
      </MDBCard>
    </>
  );
};

export default ProjectsRequest;
