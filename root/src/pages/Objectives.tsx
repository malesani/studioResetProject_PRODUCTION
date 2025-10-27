import React, { useState } from 'react';
import {
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText
} from 'mdb-react-ui-kit';

import General_Loading from '../app_components/General_Loading';

import { ObjectivesList } from '../components/objectives/ObjectivesList';


const ProjectDashboard: React.FC = () => {
    // Loading state
    const [loadingMode, setLoadingMode] = useState(true);

    // SET LOADING
    if (loadingMode) {
        return (<General_Loading theme="pageLoading" title='Dashboard Progetto' />);
    }

    return (
        <MDBRow className="d-flex justify-content-center align-items-center">
            <MDBCol className="mb-3" md="12">
                <MDBCard>
                    <MDBCardBody>
                        <MDBCardTitle>Dashboard Progetto</MDBCardTitle>
                        <MDBCardText>Informazioni di onboarding per il tuo evento.</MDBCardText>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>

            <MDBCol className="mb-3" md="12">
                <ObjectivesList project_uid='XXXX' />
            </MDBCol>
        </MDBRow >
    );
};

export default ProjectDashboard;
