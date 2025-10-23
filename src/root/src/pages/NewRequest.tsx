import React, { useEffect, useState } from 'react';
import {
    MDBRow,
    MDBCol,
    MDBCard,
} from 'mdb-react-ui-kit';

import { GeneralForm, FieldConfig } from "../app_components/GeneralForm";
import General_Loading from '../app_components/General_Loading';

import { APIProjectInfo, createProjectRequest } from '../api_module/ProjectRequests';
import { APICustomerB2BInfo, getCustomerB2BList } from '../api_module/CustomerB2BRequest';

const NewRequest: React.FC = () => {

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

    return (
        <MDBRow className="d-flex justify-content-center align-items-center">
            <MDBCol className="mb-3" md="12">
                <MDBCard className="p-4">
                    <GeneralForm<APIProjectInfo>
                        mode="create"
                        title="Nuova Richiesta Progetto"
                        icon="envelope-open-text"
                        fields={projectFields}
                        createData={createProjectRequest}
                        onSuccess={(created) => {
                            console.log("Progetto creato:", created);
                        }}
                    />
                </MDBCard>
            </MDBCol>
        </MDBRow>
    );
};

export default NewRequest;
