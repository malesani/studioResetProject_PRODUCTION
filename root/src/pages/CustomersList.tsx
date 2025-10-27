import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MDBBtn,
  MDBCard,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter
} from 'mdb-react-ui-kit';
import { DataResponse } from '../hooks/RequestFunction';
import { FieldConfig } from "../app_components/GeneralForm";
import GeneralTable, { ColumnConfig, ActionConfig } from "../app_components/GeneralTable";

import { validateCAP, validateVAT } from "../app_components/CustomValidation";

import { getCountryOptions, getStateOptions } from '../app_components/useLocation';
import { getCustomerB2BList, createCustomerB2BInfo, APICustomerB2BInfo } from '../api_module/CustomerB2BRequest';

const countryOptions = getCountryOptions();

const customerB2BFields: FieldConfig<APICustomerB2BInfo>[] = [
  { name: "business_name", label: "Ragione Sociale", required: true, grid: { md: 12, xl: 4 } },
  { name: "general_email", label: "Email Generale", required: true, type: "email", grid: { md: 7, xl: 4 } },
  { name: "website", label: "Sito Web", required: false, grid: { md: 5, xl: 4 } },
  { name: "vat_number", label: "Partita IVA", required: true, validation: validateVAT, grid: { md: 6, lg: 3 } },
  { name: "fiscal_code", label: "Codice Fiscale", required: false, grid: { md: 6, lg: 3 } },
  { name: "sdi_code", label: "Codice SDI", required: false, grid: { md: 6, lg: 3 } },
  { name: "pec", label: "PEC", required: false, type: "email", grid: { md: 6, lg: 3 }, hrAfter: true },
  {
    name: "country", label: "Nazione", type: "selectbox", required: true, grid: { md: 2, xl: 2 }, options: countryOptions,
    properties: {
      search: true,
      preventFirstSelection: true
    },
  },
  {
    name: "province", label: "Provincia", type: "selectbox", required: true, grid: { md: 3, xl: 2 }, dependencies: ["country"], getOptions: data => getStateOptions(data.country),
    properties: {
      search: true,
      preventFirstSelection: true
    },
  },
  { name: "zip_code", label: "CAP", required: true, validation: validateCAP, type: "number", grid: { md: 2, xl: 1 } },
  { name: "city", label: "Città", type: "text", required: true, grid: { md: 5, xl: 3 } },
  { name: "address", label: "Indirizzo", required: false, grid: { md: 12, xl: 4 }, hrAfter: true },
  { name: "deposit_payment_method", label: "Metodo di Pagamento Acconto", required: false, grid: { md: 6 } },
  { name: "balance_payment_method", label: "Metodo di Pagamento Saldo", required: false, grid: { md: 6 } },
  { name: "payment_terms", label: "Termini di Pagamento", required: false, grid: { md: 6 } },
  { name: "iban", label: "IBAN", required: false, grid: { md: 6 }, hrAfter: true },
  { name: "additional_requirements", label: "Requisiti Aggiuntivi", required: false, type: "text_area", grid: { md: 12 } },
  { name: "intent_declaration", label: "Dichiarazione d'Intento", required: false, type: "checkbox", grid: { md: 6 } },
  { name: "financing_tender", label: "Bando Finanziamento", required: false, type: "checkbox", grid: { md: 6 } },
];

const CustomersList: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<APICustomerB2BInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<APICustomerB2BInfo | null>(null);

  // search filters
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [estimate, setEstimate] = useState<string>('');


  const fetchCustomers = async (args: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<DataResponse<APICustomerB2BInfo[]>> => {

    const { search = "", per_page = 20 } = args;

    setLoading(true);
    setError(null);
    try {
      const { response, data } = await getCustomerB2BList({ search, per_page });
      if (response.success && data) {
        setLoading(false);
        return {
          response: response,
          data: data.customers_list,
        };
      } else {
        throw new Error(response.error || response.message || 'Failed to load customers');
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return {
        response: { success: false, message: "Unknown error", error: "Unknown error" }
      };
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleView = (customer: APICustomerB2BInfo) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };


  const columns: ColumnConfig<APICustomerB2BInfo>[] = [
    { field: 'business_name', label: 'Ragione Sociale' },
    { field: 'general_email', label: 'Email' },
    {
      field: 'userStatus',
      label: 'Status',
    },
    {
      field: 'estimate_count',
      label: 'Preventivi',
    },
  ];

  const fields = [] as any[];

  const actions: ActionConfig<APICustomerB2BInfo>[] = [
    {
      icon: 'user-gear',
      buttonProps: { color: 'secondary' },
      onClick: (c) =>
        navigate(`/customer/customer_settings/${encodeURIComponent(c.customer_uid)}`)
    },
    {
      icon: 'info',
      buttonProps: { color: 'info' },
      onClick: handleView,
    },
    {
      icon: 'user',
      buttonProps: { color: 'primary' },
      onClick: (c) =>
        navigate(`/customer/customer_dashboard/{encodeURIComponent(c.customer_uid)}`),
    },
  ];

  return (
    <>
      <MDBCard className="p-4">
        <GeneralTable<APICustomerB2BInfo, {}, {}>
          title="Clienti B2B"
          icon="users"
          columns={columns}
          fields={customerB2BFields}
          createData={createCustomerB2BInfo}
          getData={fetchCustomers}
          initialFilters={{ page: 1, per_page: 20 }}
          disableNotVisible={{ create: false, update: false, delete: false }}
          actions={actions}
          advancedFilters={true}
        />
      </MDBCard>


      {/* Modal per i dettagli del cliente */}
      <MDBModal open={modalOpen} onClose={() => setModalOpen(false)} tabIndex={-1}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <h5 className="modal-title">{selectedCustomer?.business_name}</h5>
              <MDBBtn className="btn-close" color="none" onClick={toggleModal}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              {selectedCustomer ? (
                <div>
                  <p>
                    <strong>Indirizzo:</strong> {selectedCustomer.address}, {selectedCustomer.zip_code}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedCustomer.general_email}
                  </p>
                  <p>
                    <strong>Partita IVA:</strong> {selectedCustomer.vat_number}
                  </p>
                  {/* Aggiungi altri campi se necessario */}
                </div>
              ) : (
                <p>Nessun cliente selezionato.</p>
              )}
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={toggleModal}>
                Chiudi
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
};

export default CustomersList;
