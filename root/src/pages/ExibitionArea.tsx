import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    MDBRow,
} from 'mdb-react-ui-kit';

import { General_Loading } from '../app_components/General_Loading';

import { ExhibitionAreaForm } from '../components/exhibition_area/ExhibitionAreaForm';

const ExibitionArea: React.FC = () => {
    const { project_uid: project_uid } = useParams<{ project_uid: string }>();
    if (!project_uid) {
        return (<div className="alert alert-danger">
            UID del progetto mancante in URL!
        </div>);  // o qualsiasi fallback
    }

    // Loading state
    const [loadingMode, setLoadingMode] = useState(false);

    // SET LOADING
    if (loadingMode) {
        return (<General_Loading theme="pageLoading" title='Area Espositiva' />);
    }


    return (
        <ExhibitionAreaForm />
    );
};

export default ExibitionArea;
