// HeightDetailsMDB.tsx
import React from 'react';
import {
    MDBCard,
    MDBCardBody,
    MDBRow,
    MDBCol,
    MDBBadge,
    MDBIcon,
    MDBProgress,
    MDBProgressBar,
} from 'mdb-react-ui-kit';

import { HeightTypeKeys } from './constants';

// Tipi dati
interface HeightSpecification {
    height: number;
    complessità: string;
    tempoMontaggio: string;
    costoIndicativo: number;
    personaleNecessario: number;
    permessiRichiesti: string;
    vantaggi: string[];
    svantaggi: string[];
}

export const specifications: Record<HeightTypeKeys, HeightSpecification> = {
    'low': {
        height: 250,
        complessità: 'Facile',
        tempoMontaggio: '1 giorno',
        costoIndicativo: 2,
        personaleNecessario: 3,
        permessiRichiesti: 'No',
        vantaggi: ['Setup veloce', 'Costi contenuti', 'Gestione semplice'],
        svantaggi: ['Visibilità limitata', 'Spazio ridotto'],
    },
    'medium': {
        height: 350,
        complessità: 'Media',
        tempoMontaggio: '1-2 giorni',
        costoIndicativo: 3,
        personaleNecessario: 4,
        permessiRichiesti: 'Base',
        vantaggi: ['Buona visibilità', 'Costi moderati', 'Flessibilità'],
        svantaggi: ['Richiede esperienza', 'Tempo moderato'],
    },
    'high': {
        height: 500,
        complessità: 'Professionale',
        tempoMontaggio: '3-4 giorni',
        costoIndicativo: 5,
        personaleNecessario: 6,
        permessiRichiesti: 'Avanzati',
        vantaggi: ['Massima visibilità', 'Grande impatto', 'Prestigio'],
        svantaggi: ['Costi molto elevati', 'Tempistiche lunghe', 'Complessità alta'],
    },
    'extra': {
        height: 600,
        complessità: 'Expert',
        tempoMontaggio: '6-8 giorni',
        costoIndicativo: 6,
        personaleNecessario: 8,
        permessiRichiesti: 'Completi',
        vantaggi: ['Dominanza visiva', 'Massimo prestigio', 'Unicità'],
        svantaggi: ['Costi massimi', 'Progettazione complessa', 'Tempi lunghi'],
    },
};

// Mappa complessità → classi Badge Bootstrap
function getComplexityBadgeColor(level: string) {
    switch (level) {
        case 'Facile': return 'success';
        case 'Media': return 'primary';
        case 'Professionale': return 'warning';
        case 'Expert': return 'danger';
        default: return 'secondary';
    }
}

export interface HeightDetailsProps {
    maxHeight: HeightTypeKeys;
}

export const MaxHeightResume: React.FC<HeightDetailsProps> = ({ maxHeight }) => {
    const spec = specifications[maxHeight];
    if (!spec) return null;

    // percentuale per il grafico (100% = 600cm)
    const percent_costoIndicativo = (spec.costoIndicativo / 6) * 100;

    return (
        <MDBCard className="border">
            <MDBCardBody>
                <MDBRow className="g-4">
                    {/* Colonna 1: Specifiche Tecniche */}
                    <MDBCol sm="12" md="4" lg="4">
                        <div className="d-flex flex-row flex-nowrap align-items-center justify-content-between gap-2 mb-3">
                            <h6 className="m-0 fw-bold">Specifiche Tecniche</h6>
                            <MDBBadge pill className="mx-2" color={getComplexityBadgeColor(spec.complessità)} light>
                                {spec.complessità}
                            </MDBBadge>
                        </div>
                        <div className="p-3 border rounded">
                            <MDBRow>
                                <MDBCol xs="6" className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">Tempo Montaggio</small>
                                    <b>{spec.tempoMontaggio}</b>
                                </MDBCol>
                                <MDBCol xs="6" className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">Costo Indicativo</small>
                                    <MDBProgress className='rounded w-50' height='15'>
                                        <MDBProgressBar striped bgColor='warning' width={percent_costoIndicativo} valuemin={0} valuemax={100} />
                                    </MDBProgress>
                                </MDBCol>
                                <MDBCol xs="6" className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">Personale</small>
                                    <b>{spec.personaleNecessario} persone</b>
                                </MDBCol>
                                <MDBCol xs="6" className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">Permessi</small>
                                    <b>{spec.permessiRichiesti}</b>
                                </MDBCol>
                            </MDBRow>
                        </div>
                    </MDBCol>

                    {/* Colonna 2: Vantaggi sopra Considerazioni */}
                    <MDBCol sm="6" md="3" lg="3">
                        {/* Vantaggi */}
                        <div className="mb-4">
                            <h6 className="mt-1 mb-2">Vantaggi</h6>
                            <ul className="list-unstyled">
                                {spec.vantaggi.map((p, i) => (
                                    <li key={i} className="d-flex align-items-center text-success mb-1">
                                        <MDBIcon fas icon="check" className="me-2" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </MDBCol>
                    <MDBCol sm="6" md="3" lg="3">
                        {/* Considerazioni */}
                        <div>
                            <h6 className="mt-1 mb-2">Considerazioni</h6>
                            <ul className="list-unstyled">
                                {spec.svantaggi.map((c, i) => (
                                    <li key={i} className="d-flex align-items-center text-warning mb-1">
                                        <MDBIcon fas icon="exclamation" className="me-2" />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </MDBCol>

                    {/* Colonna 3: Grafico Altezza */}
                    <MDBCol sm="12" md="2" lg="2">
                        <div
                            className="mt-0 pt-0 border-top"
                            style={{
                                minHeight: '12rem',
                                height: '100%',
                                position: 'relative',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '0.5rem'
                            }}
                        >
                            {/* linea di base */}
                            <div
                                className="position-absolute start-0 end-0"
                                style={{
                                    bottom: '0',
                                    height: '0.25rem',
                                    backgroundColor: '#0d6efd'
                                }}
                            />

                            {/* tick ogni 50cm (mezza tacca) */}
                            {Array.from({ length: 13 }).map((_, i) => {
                                const cm = i * 50;
                                const percent = (cm / 600) * 100;
                                const isMajor = cm % 100 === 0; // 100, 200... tacca grande

                                return (
                                    <React.Fragment key={i}>
                                        {/* linea di tacca */}
                                        {(cm != 0 && cm < 600) && <>
                                            <div
                                                className="position-absolute"
                                                style={{
                                                    bottom: `${percent}%`,
                                                    left: 0,
                                                    width: isMajor ? '1rem' : '0.5rem',
                                                    height: '1px',
                                                    backgroundColor: '#6c757d'
                                                }}
                                            />

                                            {/* etichetta metri sulle tacche grandi */}
                                            {isMajor && (
                                                <div
                                                    className="position-absolute"
                                                    style={{
                                                        bottom: `${percent}%`,
                                                        left: '1.1rem',
                                                        transform: 'translateY(50%)'
                                                    }}
                                                >
                                                    <small className="text-muted">{cm / 100} m</small>
                                                </div>
                                            )}
                                        </>
                                        }
                                    </React.Fragment>
                                );
                            })}

                            {/* fill dinamico */}
                            <div
                                className="position-absolute start-0 end-0"
                                style={{
                                    bottom: `${(spec.height / 600) * 100}%`,
                                    height: '0.25rem',
                                    backgroundColor: '#dc3545',
                                    transition: 'bottom .3s ease'
                                }}
                            />

                            {/* etichetta valore */}
                            <div
                                className="position-absolute"
                                style={{
                                    top: '0.5rem',
                                    right: '1rem'
                                }}
                            >
                                <h4 className="fw-bold text-dark">{spec.height / 100} m</h4>
                            </div>
                        </div>
                    </MDBCol>

                </MDBRow>
            </MDBCardBody>

        </MDBCard>
    );
};
