import React from 'react';
import {
  MDBRow,
  MDBCol,
  MDBCard,
} from 'mdb-react-ui-kit';

import { GeneralForm, FieldConfig } from "../app_components/GeneralForm";
import { validateCAP, validateVAT } from "../app_components/CustomValidation";

import { APICustomerB2BInfo, createCustomerB2BInfo } from '../api_module/CustomerB2BRequest';

import { getCountryOptions, getStateOptions } from '../app_components/useLocation';

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

const NewCustomer: React.FC = () => {

  return (
    <MDBRow className="d-flex justify-content-center align-items-center">
      <MDBCol className="mb-3" md="12">
        <MDBCard className="p-4 pb-2">
          <GeneralForm<APICustomerB2BInfo>
            mode="create"
            title="Nuovo Cliente"
            icon='user-plus'
            fields={customerB2BFields}
            createData={createCustomerB2BInfo}
            onSuccess={(created) => {
              console.log("Creato:", created);
            }}
          />
        </MDBCard>
      </MDBCol>
    </MDBRow>
  );
};

export default NewCustomer;
