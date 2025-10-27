import React from 'react';
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

import { InspirationForm } from '../components/inspiration/InspirationForm';

const ProjectPlanning: React.FC = () => {
    const { project_uid: project_uid } = useParams<{ project_uid: string }>();
    if (!project_uid) {
        return (<div className="alert alert-danger">
            UID del progetto mancante in URL!
        </div>);  // o qualsiasi fallback
    }


    return (
        <MDBRow className="d-flex justify-content-center align-items-center">
            <MDBCol className="mb-3" md="12">
                <MDBCard>
                    <MDBCardBody>
                        <MDBCardTitle><MDBIcon icon="compass" className="me-3"/>Ispirazione</MDBCardTitle>
                        <MDBCardText>Lasciati ispirare e trova lo stile adatto alle tue esigenze espositive.</MDBCardText>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>

            <MDBCol className="mb-3" md="12">

                <MDBCard>
                    <MDBCardBody>
                        <InspirationForm project_uid={project_uid} />
                    </MDBCardBody>
                </MDBCard>


            </MDBCol>
        </MDBRow >
    );
};

export default ProjectPlanning;
