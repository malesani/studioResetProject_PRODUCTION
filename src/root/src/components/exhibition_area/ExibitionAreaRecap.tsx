import React from 'react';
import {
    MDBCard,
    MDBCardHeader,
    MDBCardTitle,
    MDBCardBody,
    MDBRow,
    MDBCol,
    MDBIcon,
    MDBBtn
} from 'mdb-react-ui-kit';

import {
    standTypesInfo,
    StandTypeKeys
} from './constants';
import {
    platformTypeInfo,
    PlatformTypeKeys
} from './constants';
import {
    heightTypesInfo,
    HeightTypeKeys
} from './constants';
import {
    SuspendedElementsInfo,
    SuspendedElementKeys
} from './constants';
import { MaxHeightResume } from './MaxHeightResume';

export interface ExhibitionAreaInfo {
    surface_mq: number;
    obstacles: boolean;
    obstacles_info: string;
    standType: StandTypeKeys;
    platformType: PlatformTypeKeys;
    maxHeight: HeightTypeKeys;
    suspendedElements: SuspendedElementKeys[];
}

interface ExhibitionAreaRecapProps {
    data: ExhibitionAreaInfo | undefined;
    onEdit: () => void;
}

const ExhibitionAreaRecap: React.FC<ExhibitionAreaRecapProps> = ({ data, onEdit }) => {
    if (!data) {
        return;
    }
    const stand = standTypesInfo.find(s => s.value === data.standType);
    const platform = platformTypeInfo.find(p => p.value === data.platformType);
    const heightOption = heightTypesInfo.find(h => h.value === data.maxHeight);

    return (
        <MDBCard className="my-4">
            <MDBCardHeader>
                <MDBCardTitle cnassName="d-flex flex-row justify-content-between">
                    <div><MDBIcon fas icon="sticky-note" className="me-3" />Riepilogo Area Espositiva</div>
                    <MDBBtn color="primary" size="sm" rounded onClick={onEdit}>Modifica</MDBBtn>
                </MDBCardTitle>
            </MDBCardHeader>
            <MDBCardBody>
                <MDBRow className="g-4 mb-3">
                    <MDBCol md="4">
                        <h6 className="text-muted">Superficie</h6>
                        <p>{data.surface_mq} mq</p>
                    </MDBCol>
                    <MDBCol md="4">
                        <h6 className="text-muted">Impedimenti</h6>
                        <p>
                            {data.obstacles ? 'Sì' : 'No'}
                            {data.obstacles && data.obstacles_info && (
                                <><br /><small>{data.obstacles_info}</small></>
                            )}
                        </p>
                    </MDBCol>
                    <MDBCol md="4">
                        <h6 className="text-muted">Tipologia Superficie</h6>
                        {stand ? (
                            <>
                                <strong>{stand.name}</strong>
                                <p className="mb-0"><small>{stand.description}</small></p>
                            </>
                        ) : null}
                    </MDBCol>
                </MDBRow>

                <MDBRow className="g-4 mb-3">
                    <MDBCol md="4">
                        <h6 className="text-muted">Tipologia Pedana</h6>
                        {platform ? (
                            <>
                                <strong>{platform.name}</strong>
                                <p className="mb-0"><small>{platform.description}</small></p>
                            </>
                        ) : null}
                    </MDBCol>
                    <MDBCol md="4">
                        <h6 className="text-muted">Altezza Massima</h6>
                        {heightOption ? (
                            <>
                                <strong>{heightOption.name}</strong>
                                <p className="mb-0"><small>{heightOption.description}</small></p>
                            </>
                        ) : null}
                    </MDBCol>
                    <MDBCol md="4">
                        <h6 className="text-muted">Elementi Sospesi</h6>
                        {data.suspendedElements && data.suspendedElements.length > 0 ? (
                            <ul className="list-unstyled">
                                {data.suspendedElements.map(key => {
                                    const item = SuspendedElementsInfo.find(e => e.value === key);
                                    return item ? (
                                        <li key={key} className="d-flex align-items-center mb-2">
                                            {item.icon && <MDBIcon fas icon={item.icon} className="me-2" />}
                                            <span>{item.name}</span>
                                        </li>
                                    ) : null;
                                })}
                            </ul>
                        ) : (
                            <p>Nessuno</p>
                        )}
                    </MDBCol>
                </MDBRow>
            </MDBCardBody>
        </MDBCard >
    );
};

export default ExhibitionAreaRecap;
