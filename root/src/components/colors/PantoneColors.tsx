import React, { useState, useEffect } from 'react';
import {
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBInput,
    MDBBtn,
    MDBIcon
} from 'mdb-react-ui-kit';

import { useIsMobile } from '../../app_components/ResponsiveModule'
import { useFormAlert } from '../../app_components/GeneralAlert';
import pantoneMap from 'pantone-colors';

export type PantoneColorsProps = {
    pantoneColors: string[];
    addColor: (code: string) => void;
    removeColor: (index: number) => void;
    maxColors?: number;
};

export function PantoneColors({
    pantoneColors,
    addColor,
    removeColor,
    maxColors = 5,
}: PantoneColorsProps) {
    const isMobile = useIsMobile(992);

    const { showAlertInfo, FormAlert } = useFormAlert();
    const [newCode, setNewCode] = useState<string>('');

    useEffect(() => {
        showAlertInfo(
            `Inserisci fino a ${maxColors} codici Pantone per la tua palette personalizzata.`
        );
    }, []);

    const handleAdd = () => {
        const code = newCode.trim().toUpperCase();

        if (
            code &&
            pantoneColors.length < maxColors &&
            !pantoneColors.includes(code)
        ) {
            addColor(code);
            setNewCode('');
        }
    };

    return (
        <div className="container py-2">
            <FormAlert />

            <div className="d-flex flex-column flex-md-row align-items-end mb-4">
                {/* Input che cresce per occupare lo spazio disponibile */}
                <div className="flex-grow-1 mb-3 mb-md-0 me-md-3">
                    <MDBInput
                        label="Codice Pantone (e.g. 19-4052)"
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                    />
                </div>

                {/* Bottone fisso alla destra */}
                <div>
                    <MDBBtn
                        color="primary"
                        className="text-nowrap"
                        floating={isMobile}
                        disabled={pantoneColors.length >= maxColors || !newCode.trim()}
                        onClick={handleAdd}
                    >
                        <MDBIcon fas icon="plus" className={!isMobile ? 'me-2' : ''} />
                        {!isMobile && 'Aggiungi'}
                    </MDBBtn>
                </div>
            </div>
            {pantoneColors.length > 0 && (
                <MDBRow className="g-4">
                    {pantoneColors.map((code, idx) => {
                        const colorMap = pantoneMap as Record<string, string>;
                        const hex = colorMap[code] || '#ffffff';
                        return (
                            <MDBCol key={idx} sm="6" md="4" lg="3">
                                <MDBCard
                                    className="position-relative"
                                    style={{ backgroundColor: hex }}
                                >
                                    {/* Pulsante rimuovi */}
                                    <MDBBtn
                                        size="sm"
                                        color="light"
                                        floating
                                        className="position-absolute top-0 end-0 m-1"
                                        onClick={() => removeColor(idx)}
                                    >
                                        <MDBIcon icon="times" />
                                    </MDBBtn>


                                    <MDBCardBody className="text-center" style={{ height: 100 }}>
                                        {/* Codice hex in overlay */}
                                        <div className="position-absolute bottom-0 start-0 w-100 text-truncate text-center bg-white bg-opacity-75">
                                            <small className="d-block text-muted m-0 p-1 pb-0">Pantone - {code}</small>
                                            <small className="d-block text-muted m-0 p-1 pt-0">{hex == '#ffffff' ? 'Not found' : hex}</small>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                        );
                    })}
                </MDBRow>
            )}

            {pantoneColors.length >= maxColors && (
                <p className="text-sm text-warning mt-3">
                    Hai raggiunto il limite massimo di {maxColors} colori Pantone.
                </p>
            )}
        </div>
    );
}
