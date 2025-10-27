import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MDBBtn, MDBCard, MDBCol, MDBContainer, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon, MDBInput, MDBInputGroup, MDBRow } from 'mdb-react-ui-kit';
import { DataResponse } from '../hooks/RequestFunction';

import General_Loading from "../app_components/General_Loading";
import { FieldConfig } from "../app_components/GeneralForm";
import GeneralTable, { ColumnConfig, ActionConfig } from "../app_components/GeneralTable";
import { General_ContentSwitcher, ContentConfig } from '../app_components/General_ContentSwitcher';

import { APICustomerB2BInfo, getCustomerB2BList } from '../api_module/CustomerB2BRequest';
import { fetchProjects, createProject, APIProjectInfo } from '../api_module/ProjectRequests';

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<APICustomerB2BInfo[]>([]);
  const [loadingMode, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"griglia" | "cards">("griglia");

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
      const { response, data } = await fetchProjects({ search, page, per_page });
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

  // azioni su ogni riga: ad es. vai al cruscotto del progetto
  const actions: ActionConfig<APIProjectInfo>[] = [
    {
      icon: 'folder-open',
      buttonProps: { color: 'primary' },
      onClick: (proj) =>
        navigate(`/management/project_dashboard/${encodeURIComponent(proj.project_uid)}`)
    }
  ];


  if (error) return <div className="text-danger">Errore: {error}</div>;

  // SET LOADING
  if (loadingMode) {
    return (<General_Loading theme="pageLoading" />);
  }

  const contents: ContentConfig[] = [
    {
      icon: 'fas fa-fas fa-project-diagram fa-fw',
      title: 'Progetti Attivi',
      startOpen: false,
      contentElement: (
        <>
          <MDBContainer className="mt-4">
            {/* 🔍 Campo di ricerca */}
           <MDBRow className="align-items-center bg-white p-3 rounded-2 border mb-5 g-2">
              <MDBCol xs="12" md="6" lg="2">
                <MDBInputGroup className="w-100">
                  <span className="input-group-text bg-white border-end-0">
                    <MDBIcon fas icon="search" />
                  </span>
                  <MDBInput
                    type="text"
                    placeholder="Cerca Progetti..."
                    className="border-start-0"
                  />
                </MDBInputGroup>
              </MDBCol>

          {/* 🔽 Filtro stato */}
          <MDBCol xs="4" md="3" lg="2">
            <MDBDropdown className="w-100">
              <MDBDropdownToggle color="light" className="w-100 text-start">
                Tutti gli stati
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                <MDBDropdownItem link>Richiesta</MDBDropdownItem>
                <MDBDropdownItem link>In Corso</MDBDropdownItem>
                <MDBDropdownItem link>Completata</MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBCol>

            
              <MDBCol xs="4" md="6" lg="2">
                <MDBDropdown className="w-100">
                  <MDBDropdownToggle color="light" className="w-100 text-start">
                    Tutti i settori
                  </MDBDropdownToggle>
                  <MDBDropdownMenu>
                    <MDBDropdownItem link>Arredamento</MDBDropdownItem>
                    <MDBDropdownItem link>Moda</MDBDropdownItem>
                    <MDBDropdownItem link>Alimentazione</MDBDropdownItem>
                    <MDBDropdownItem link>Packaging</MDBDropdownItem>
                  </MDBDropdownMenu>
                </MDBDropdown>
              </MDBCol>


              <MDBCol xs="12" md="6" lg="4" className="d-flex justify-content-end flex-wrap">
                <div className="d-flex align-items-center gap-2">
                  <MDBBtn
                    color="light"
                    className="px-3"
                    title={viewMode === "griglia" ? "Vista cards" : "Vista griglia"}
                    onClick={() => setViewMode(viewMode === "griglia" ? "cards" : "griglia")}
                  >
                    <MDBIcon fas icon={viewMode === "griglia" ? "list" : "th-large"} />
                  </MDBBtn>

                  <MDBBtn color="light" className="px-3" title="Vista calendario">
                    <MDBIcon fas icon="calendar-alt" />
                  </MDBBtn>

                  <MDBBtn color="light" className="px-3" title="Esporta">
                    <MDBIcon fas icon="download" className="me-2" />
                    Esporta
                  </MDBBtn>
                  <MDBBtn color="light" className="px-3" title="Importa">
                    <MDBIcon fas icon="upload" className="me-2" />
                    Importa
                  </MDBBtn>
                </div>
              </MDBCol>
            </MDBRow> 

            <MDBRow className="mb-4">
              <MDBCard className="border rounded-2 bg-white p-4">
                <GeneralTable<APIProjectInfo, {}, {}>
                  title="Lista Progetti"
                  icon="tasks"
                  columns={columns}
                  fields={projectFields}
                  getData={fetchProjectRows}
                  createData={createProject}
                  initialFilters={{ page: 1, per_page: 20 }}
                  disableNotVisible={{ create: false, update: false, delete: false }}
                  actions={actions}
                />
              </MDBCard>
            </MDBRow>
          </MDBContainer>
        </>
      ),
    },
    {
      icon: 'plus-fas fa-fas fa-envelope-open-text',
      title: 'Richieste Progetti',
      startOpen: true,
      contentElement: (
        <MDBContainer className="mt-4">

          <MDBRow className="mb-4">
            <MDBCard className="border rounded-2 bg-white p-4">
              <GeneralTable<APIProjectInfo, {}, {}>
                title="Lista richiesta Progetti"
                icon="tasks"
                columns={columns}
                fields={projectFields}
                getData={fetchProjectRows}
                createData={createProject}
                initialFilters={{ page: 1, per_page: 20 }}
                disableNotVisible={{ create: false, update: false, delete: false }}
                actions={actions}
              />
            </MDBCard>
          </MDBRow>
        </MDBContainer>
      ),
    },
    {
      icon: 'history',
      title: 'Progetti Storici',
      startOpen: true,
      contentElement: (
        <MDBCard className="mt-2 p-4">

        </MDBCard>
      ),
    }
  ];
  return (
    <>
      <MDBContainer className="py-4">
        <MDBRow className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold">Gestione Progetti</h3>
              <p className="text-muted mb-0">
                Gestisci tutte i progetti fieristici e gli eventi dei tuoi clienti.
              </p>
            </div>
          </div>
        </MDBRow>

        <MDBRow>
          <General_ContentSwitcher switchMode='tabs' properties={{ pills: true, fill: true }} contents={contents} />
        </MDBRow>

      </MDBContainer >
    </>
  );
};

export default ProjectsList;
