

import { useEffect, useState } from "react";
import {
    getCustomerTeamMembersList,
    APICustTeamMemberInfo,
} from "../api_module/CustomerTeamMemberRequest";
import { ExtraServices } from '../components/extraServices/ExtraServices';
import { MDBCard, MDBCardBody, MDBContainer, MDBRow } from "mdb-react-ui-kit";
import { General_Loading } from '../app_components/General_Loading';


const ServiziExtra: React.FC = () => {

    const [teamMembers, setTeamMembers] = useState<APICustTeamMemberInfo[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const [loadingMode, setLoadingMode] = useState(true);

    const toggleService = (id: string) => {
        setSelectedServices(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };
    useEffect(() => {
        let isMounted = true;            // per evitare setState su componente smontato
        async function fetchTeamMembers() {
            setLoadingMode(true);
            try {
                const args = { customer_uid: 'Ioj8PMjS' };
                const responseData = await getCustomerTeamMembersList(args);
                if (responseData.response.success && responseData.data) {
                    if (isMounted) setTeamMembers(responseData.data);
                    console.log('teamMembers', responseData.data);

                } else {
                    console.error('Fetch fallito:', responseData.response.message);
                }
            } catch (err) {
                console.error('Errore nella richiesta:', err);
            } finally {
                if (isMounted) setLoadingMode(false);
            }
        }
        fetchTeamMembers();
        return () => { isMounted = false; };
    }, []);

    // SET LOADING
    if (loadingMode) {
        return (<General_Loading theme="pageLoading" />);
    }

    return (
        <MDBContainer className="py-4">
            <MDBRow className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold">Seleziona dei Servizi Extra </h3>
                        <p className="text-muted mb-0">
                            Gestione dei servizi extra per stand fieristici: opzioni personalizzabili come trasporto, montaggio, decorazioni e supporto tecnico.
                        </p>
                    </div>
                </div>
            </MDBRow>
            <MDBCard className="p-4">
                <MDBRow className="mb-2">
                    <MDBCardBody>
                        <ExtraServices
                            teamMembers={teamMembers}
                            selectedServices={selectedServices}
                            onToggleService={toggleService}
                        />
                    </MDBCardBody>
                </MDBRow>
            </MDBCard>
        </MDBContainer>
    );
}


export default ServiziExtra;