import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBIcon
} from 'mdb-react-ui-kit';

import {
    getCustomerTeamMembersList,
    APICustTeamMemberInfo,
} from "../api_module/CustomerTeamMemberRequest";

import { General_ContentSwitcher } from '../app_components/General_ContentSwitcher';
import { General_Loading } from '../app_components/General_Loading';

import { InspirationForm } from '../components/inspiration/InspirationForm';
import { ObjectivesList } from '../components/objectives/ObjectivesList';
import { ConceptsList } from '../components/concepts/ConceptsList';
import { DesignList } from '../components/design/DesignList';

import { ColorPage } from '../components/colors/ColorPage';
import { TexturePage } from '../components/textures/TexturePage';

const ProjectPlanning: React.FC = () => {
    const { project_uid: project_uid } = useParams<{ project_uid: string }>();
    if (!project_uid) {
        return (<div className="alert alert-danger">
            UID del progetto mancante in URL!
        </div>);  // o qualsiasi fallback
    }

    // Loading state
    const [loadingMode, setLoadingMode] = useState(true);

    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    // funzione di toggle: se già presente rimuove, altrimenti aggiunge
    const toggleService = (id: string) => {
        setSelectedServices(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const [teamMembers, setTeamMembers] = useState<APICustTeamMemberInfo[]>([]);

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
        <MDBRow className="d-flex justify-content-center align-items-center">
            <MDBCol className="mb-3" md="12">
                <MDBCard>
                    <MDBCardBody>
                        <MDBCardTitle><MDBIcon icon="tasks" className="me-3"/>Fa le tue scelte</MDBCardTitle>
                        <MDBCardText>Inserisci le tue preferenze, i nostri progettisti potranno usarle come base per fornirti la proporta ideale.</MDBCardText>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>

            <MDBCol className="mb-3" md="12">

                <MDBCard>
                    <MDBCardBody>
                        <General_ContentSwitcher
                            switchMode="tabs"
                            properties={{
                                hrAfter: true,
                                fill: true
                            }}
                            contents={
                                [
                                    {
                                        icon: "bullseye",
                                        title: "Obbiettivi",
                                        startOpen: false,
                                        className: "p-1",
                                        contentElement: <ObjectivesList project_uid={project_uid} />
                                    },
                                    {
                                        icon: "cogs",
                                        title: "Concept",
                                        startOpen: false,
                                        className: "p-1",
                                        contentElement: <ConceptsList project_uid={project_uid} />
                                    },
                                    {
                                        icon: "pencil-ruler",
                                        title: "Design",
                                        startOpen: false,
                                        className: "p-1",
                                        contentElement: <DesignList project_uid={project_uid} />
                                    },
                                    {
                                        icon: "swatchbook",
                                        title: "Colori",
                                        startOpen: false,
                                        className: "p-1",
                                        contentElement: <ColorPage />
                                    },
                                    {
                                        icon: "object-group",
                                        title: "Texture",
                                        startOpen: false,
                                        className: "p-1",
                                        contentElement: <TexturePage />
                                    },
                                ]
                            } />
                    </MDBCardBody>
                </MDBCard>


            </MDBCol>
        </MDBRow >
    );
};

export default ProjectPlanning;
