
import React, { ChangeEvent, useState } from "react";

import { GeneralForm, FieldConfig, SelectData } from '../app_components/GeneralForm';

import { predefinedObjectives } from '../components/preventivi/preventivi';

import OffertaEconomicaEdit from './OffertaEconomicaEdit'

import { useNavigate } from 'react-router-dom';

import { EstimateInfo, EstimateItem } from '../api_module/estimates/EstimatesRequest';

import {
    MDBContainer,
    MDBCard,
    MDBCardBody,
    MDBRow,
    MDBCol,
    MDBInputGroup,
    MDBIcon,
    MDBInput,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem,
    MDBBtn,
    MDBBadge,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalHeader,
    MDBModalTitle
} from "mdb-react-ui-kit";

const stats = {
    totali: 1,
    inviati: 0,
    accettati: 1,
    valoreTotale: "0,00 €",
};

const preventivi: EstimateInfo[] = [
    {
        project_uid: "",
        preventivo_uid: "1",
        customer_uid: "",
        tipo: "",
        fiera: "",
        stato: "",
        validitaFino: "",
        descrizione: "",
        titolo: "",
        importo: "",
        note: "",
    },
    {
        project_uid: "",
        preventivo_uid: "2",
        customer_uid: "",
        tipo: "",
        fiera: "",
        stato: "",
        validitaFino: "",
        descrizione: "",
        titolo: "",
        importo: "",
        note: "",
    },
    {
        project_uid: "",
        preventivo_uid: "5",
        customer_uid: "",
        tipo: "",
        fiera: "",
        stato: "",
        validitaFino: "",
        descrizione: "",
        titolo: "",
        importo: "",
        note: "",
    },
];

export interface ObjectivesListProps {
    project_uid: string;
}


const OffertaEconomica: React.FC<ObjectivesListProps> = ({ project_uid }) => {
    const navigate = useNavigate();


    //list preventivi
    const [preventiviList, setPreventiviList] = useState<EstimateInfo[]>(preventivi);


    //stato da visualizzare nell url quando entro in edit
    const [preventivo_uid, setPreventivoUid] = useState<string>("");

    //far comparire e scomparire il create preventivo
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const toggleModal = () => setModalOpen(!modalOpen);

    // far comparire l'edit
    const [ShowOffertaEconomicaEdit, setShowOffertaEconomicaEdit] = useState(false);


    // per general form create preventivo
    const [formData, setFormData] = useState({
        customer_uid: "",
        tipoPreventivo: "fiera",
        fiera: "",
        stato: "Bozza",
        validoFino: "",
        descrizione: "",
        titolo: "",
        importo: 0,
        note: "",
    });

    const preventiviOptions: SelectData[] = predefinedObjectives.map(preventivo => ({
        value: preventivo.preventivo_uid,
        text: preventivo.title,
        secondaryText: preventivo.description,
        icon: preventivo.icon
    }));


    const Product_FormFields: FieldConfig<EstimateInfo>[] = [
        {
            name: "customer_uid", label: "Clienti", required: true, grid: { md: 12 },
            type: "selectbox", options: [
                { text: "Azienda Prova 1", value: "Azienda Prova 1" },
                { text: "Azienda Prova 3", value: "Azienda Prova 1" },
                { text: "Azienda Prova 1", value: "Azienda Prova 1" },
                { text: "Azienda Prova 1", value: "Azienda Prova 1" }
            ],
            properties: {
                multiple: false,
                hideChoseSomething: true,
            }, hrAfter: true,
            extraElements: [
                {
                    position: "before", grid: { md: 12 },
                    element: () => {
                        return <>
                            <MDBIcon fas icon="id-card" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">
                                Selezziona cliente
                            </h5>
                        </>;
                    }
                }
            ]
        },
        {
            name: "tipo", label: "Tipo Preventivo", required: true, grid: { md: 12 },
            type: "selectbox", customElementKey: "cards", options: preventiviOptions,
            properties: {
                multiple: false,
                showSummaryPills: true,
                hideChoseSomething: true,
                gridConfig: {
                    md: 2,
                    xl: 3,
                    xxl: 4
                }
            },
            extraElements: [
                {
                    position: "before", grid: { md: 12 },
                    element: () => {
                        return <>
                            <MDBIcon fas icon="file-signature" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">
                                Tipo Preventivo
                            </h5>
                        </>;
                    }
                }
            ]
        },
        {
            name: "fiera", label: "Fiera", required: true, grid: { md: 12 },
            type: "selectbox", options: [{ text: "Host Milano 2025", value: "Host Milano 2025" }, { text: "MIDO Eyewear Show", value: "hgvukj" }, { text: "EIMA International 2026", value: "dsgsrbccz" }],
            properties: {
                multiple: false,
                hideChoseSomething: true,
            }, hrAfter: true
        },

        {
            name: "stato", label: "Stato", required: true, grid: { md: 6 },
            type: "selectbox", options: [{ text: "attivo", value: "attivo" }],
            properties: {
                multiple: false,
                hideChoseSomething: true,
            },
            extraElements: [
                {
                    position: "before", grid: { md: 12 },
                    element: () => {
                        return <>
                            <MDBIcon fas icon="question-circle" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">
                                Stato e validita
                            </h5>
                        </>;
                    }
                }
            ]
        },
        {
            name: "validitaFino", label: "validita Fino", required: true, grid: { md: 6 }, type: "text", hrAfter: true
        },

        {
            name: "descrizione", label: "Descrizione dettagliata del prodotto", required: true, type: "text_area", grid: { md: 12 },
            hrAfter: true,
            extraElements: [
                {
                    position: "before", grid: { md: 12 },
                    element: () => {
                        return <>
                            <MDBIcon fas icon="file-alt" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">
                                Descrizione
                            </h5>
                        </>;
                    }
                }
            ]
        },

        {
            name: "titolo", label: "Titolo Preventivo", required: true, grid: { md: 6 }, type: "text",

            extraElements: [
                {
                    position: "before", grid: { md: 12 },
                    element: () => {
                        return <>
                            <MDBIcon fas icon="sticky-note" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">
                                Note e Dettagli Aggiuntivi

                            </h5>
                        </>;
                    }
                }
            ]
        },
        {
            name: "importo", label: "Importo", required: true, grid: { md: 4 }, type: "number",
        },
        {
            name: "note", label: "Note aggiuntive, condizione, termini di pagamento, clausole speciali..", required: true, type: "text_area", grid: { md: 12 },
        }

    ]


    return (
        <>
            {/* visualizzazione create ed edit */}
            {!ShowOffertaEconomicaEdit ? (
                <MDBContainer className="py-4">
                    <MDBRow className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold">Gestione Preventivi</h3>
                                <p className="text-muted mb-0">
                                    Gestisci tutti i preventivi del sistema
                                </p>
                            </div>
                            <MDBBtn color="success" onClick={toggleModal}>
                                <MDBIcon fas icon="plus" className="me-2" /> Nuovo Preventivo
                            </MDBBtn>
                        </div>
                    </MDBRow>

                    <MDBRow className="g-3 mb-5">
                        {/* 🔹 Preventivi Totali */}
                        <MDBCol md="3">
                            <MDBCard
                                className="border-0"
                                style={{
                                    backgroundColor: "#f2fdf8",
                                    border: "1px solid #c8f0d1",
                                }}
                            >
                                <MDBCardBody className="d-flex align-items-center p-3">
                                    <div
                                        className="rounded-2 d-flex justify-content-center align-items-center me-3"
                                        style={{
                                            backgroundColor: "#d7f5e4",
                                            width: "45px",
                                            height: "45px",
                                        }}
                                    >
                                        <MDBIcon fas icon="file-alt" className="text-success" />
                                    </div>
                                    <div>
                                        <p className="fw-semibold mb-1 text-success">
                                            Preventivi Totali
                                        </p>
                                        <h4 className="fw-bold text-success mb-0">{stats.totali}</h4>
                                    </div>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        {/* 🔹 Preventivi Inviati */}
                        <MDBCol md="3">
                            <MDBCard
                                className="border-0"
                                style={{
                                    backgroundColor: "#f3f7ff",
                                    border: "1px solid #cdddfc",
                                }}
                            >
                                <MDBCardBody className="d-flex align-items-center p-3">
                                    <div
                                        className="rounded-2 d-flex justify-content-center align-items-center me-3"
                                        style={{
                                            backgroundColor: "#e2ebff",
                                            width: "45px",
                                            height: "45px",
                                        }}
                                    >
                                        <MDBIcon fas icon="eye" className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="fw-semibold mb-1 text-primary">
                                            Preventivi Inviati
                                        </p>
                                        <h4 className="fw-bold text-primary mb-0">{stats.inviati}</h4>
                                    </div>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        {/* 🔹 Preventivi Accettati */}
                        <MDBCol md="3">
                            <MDBCard
                                className="border-0"
                                style={{
                                    backgroundColor: "#f2fdf8",
                                    border: "1px solid #c8f0d1",
                                }}
                            >
                                <MDBCardBody className="d-flex align-items-center p-3">
                                    <div
                                        className="rounded-2 d-flex justify-content-center align-items-center me-3"
                                        style={{
                                            backgroundColor: "#d7f5e4",
                                            width: "45px",
                                            height: "45px",
                                        }}
                                    >
                                        <MDBIcon fas icon="check-circle" className="text-success" />
                                    </div>
                                    <div>
                                        <p className="fw-semibold mb-1 text-success">
                                            Preventivi Accettati
                                        </p>
                                        <h4 className="fw-bold text-success mb-0">
                                            {stats.accettati}
                                        </h4>
                                    </div>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        {/* 🔸 Valore Totale */}
                        <MDBCol md="3">
                            <MDBCard
                                className="border-0"
                                style={{
                                    backgroundColor: "#fff9f0",
                                    border: "1px solid #ffe0b3",
                                }}
                            >
                                <MDBCardBody className="d-flex align-items-center p-3">
                                    <div
                                        className="rounded-2 d-flex justify-content-center align-items-center me-3"
                                        style={{
                                            backgroundColor: "#ffe8d4",
                                            width: "45px",
                                            height: "45px",
                                        }}
                                    >
                                        <MDBIcon fas icon="dollar-sign" className="text-warning" />
                                    </div>
                                    <div>
                                        <p className="fw-semibold mb-1 text-warning">Valore Totale</p>
                                        <h4 className="fw-bold text-warning mb-0">
                                            {stats.valoreTotale}
                                        </h4>
                                    </div>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                    </MDBRow>

                    <MDBRow className="align-items-center bg-white p-3 rounded-2 border mb-4 g-2">
                        {/* Campo di ricerca */}
                        <MDBCol xs="12" md="5" lg="6">
                            <MDBInputGroup className="w-100">
                                <span className="input-group-text bg-white border-end-0">
                                    <MDBIcon fas icon="search" />
                                </span>
                                <MDBInput
                                    type="text"
                                    placeholder="Cerca preventivi..."
                                    className="border-start-0"
                                />
                            </MDBInputGroup>
                        </MDBCol>

                        {/* Filtro stato */}
                        <MDBCol xs="6" md="3" lg="2">
                            <MDBDropdown className="w-100">
                                <MDBDropdownToggle color="light" className="w-100 text-start">
                                    Tutti gli stati
                                </MDBDropdownToggle>
                                <MDBDropdownMenu>
                                    <MDBDropdownItem link>Bozza</MDBDropdownItem>
                                    <MDBDropdownItem link>Inviato</MDBDropdownItem>
                                    <MDBDropdownItem link>Accettato</MDBDropdownItem>
                                    <MDBDropdownItem link>Rifiutato</MDBDropdownItem>
                                </MDBDropdownMenu>
                            </MDBDropdown>
                        </MDBCol>

                        {/* Filtro settore */}
                        <MDBCol xs="6" md="3" lg="2">
                            <MDBDropdown className="w-100">
                                <MDBDropdownToggle color="light" className="w-100 text-start">
                                    Tutti i tipi
                                </MDBDropdownToggle>
                                <MDBDropdownMenu>
                                    <MDBDropdownItem link>Fiera</MDBDropdownItem>
                                    <MDBDropdownItem link>Showroom</MDBDropdownItem>
                                    <MDBDropdownItem link>Altro</MDBDropdownItem>
                                </MDBDropdownMenu>
                            </MDBDropdown>
                        </MDBCol>

                        {/* Botones de acción */}
                        <MDBCol xs="12" md="12" lg="2" className="d-flex justify-content-end flex-wrap">
                            <div className="d-flex gap-2">
                                <MDBBtn color="light" className="px-3" title="Esporta">
                                    <MDBIcon fas icon="download" className="me-2" />
                                    Esporta
                                </MDBBtn>
                                <MDBBtn color="light" className="px-3" title="Importa">
                                    <MDBIcon fas icon="upload" className="me-2" />
                                    Importa
                                </MDBBtn>
                            </div>
                        </MDBCol>
                    </MDBRow>

                    {/* 🔹 LISTA PREVENTIVI */}
                    <MDBRow className="mb-4">
                        <MDBCard
                            className="border rounded-3 mb-3"
                        >
                            {/* 🔹 Header Grid */}
                            <div
                                className="d-grid fw-semibold text-muted px-3 py-3"
                                style={{
                                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.5fr 1fr",
                                    fontSize: "0.9rem",
                                    borderBottom: "1px solid #e9ecef",
                                }}
                            >
                                <div className="text-dark">
                                    <MDBIcon fas icon="file-alt" className="me-2 text-success" />
                                    Preventivo
                                </div>
                                <div>
                                    <MDBIcon fas icon="user" className="me-2 text-success" />
                                    Cliente
                                </div>
                                <div>
                                    <MDBIcon fas icon="layer-group" className="me-2 text-success" />
                                    Tipo
                                </div>
                                <div>
                                    <MDBIcon fas icon="toggle-on" className="me-2 text-success" />
                                    Stato
                                </div>
                                <div>
                                    <MDBIcon fas icon="dollar-sign" className="me-2 text-success" />
                                    Importo
                                </div>
                                <div>
                                    <MDBIcon fas icon="calendar" className="me-2 text-success" />
                                    Data
                                </div>
                                <div>
                                    <MDBIcon fas icon="cogs" className="me-2 text-success" />
                                    Azioni
                                </div>
                            </div>

                            {/* 🔹 Filas tipo grid */}
                            {preventiviList.map((p, i) => (
                                <MDBCardBody
                                    key={i}
                                    className="d-grid align-items-center px-3 py-3"
                                    style={{
                                        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.5fr 1fr",
                                        backgroundColor: i % 2 === 0 ? "#fff" : "#fcfcfc",
                                        borderBottom: "1px solid #e9f8ef",
                                    }}
                                >
                                    {/* Preventivo */}
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-2 d-flex justify-content-center align-items-center text-success me-3"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                backgroundColor: "#d7f5e4",
                                            }}
                                        >
                                            <MDBIcon fas icon="file-alt" />
                                        </div>
                                        <div>
                                            <p className="fw-bold mb-0">{p.titolo}</p>
                                            <p className="text-muted small mb-0">{p.preventivo_uid}</p>
                                        </div>
                                    </div>

                                    {/* Cliente */}
                                    <div className="fw-normal text-dark">{p.customer_uid}</div>

                                    {/* Tipo */}
                                    <div>
                                        <p className="mb-0">{p.tipo}</p>
                                    </div>

                                    {/* Stato */}
                                    <div>
                                        <MDBBadge
                                            color="success"
                                            light
                                            className="px-2 py-1 mb-1"
                                            style={{
                                                backgroundColor: "#e8fcef",
                                                color: "#1b5e20",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {p.stato}
                                        </MDBBadge>
                                        <div>
                                            <MDBBadge
                                                color="warning"
                                                light
                                                className="px-2 py-1 text-warning bg-opacity-10 border-0"
                                                style={{
                                                    backgroundColor: "#fff2e0",
                                                    color: "#d35400",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                <MDBIcon fas icon="briefcase" className="me-1" />
                                                Crea commessa
                                            </MDBBadge>
                                        </div>
                                    </div>

                                    {/* Importo */}
                                    <div className="fw-bold text-dark">{p.importo}</div>

                                    {/* Data */}
                                    <div className="text-muted small">
                                        {/* <div>{p.data}</div> */}
                                        <div>Valido fino: {p.validitaFino}</div>
                                    </div>

                                    {/* Azioni */}
                                    <div className="d-flex gap-2">
                                        <MDBBtn
                                            size="sm"
                                            color="link"
                                            className="text-muted p-0"
                                            title="Visualizza"
                                        >
                                            <MDBIcon fas icon="eye" />
                                        </MDBBtn>
                                        <MDBBtn
                                            size="sm"
                                            color="link"
                                            className="text-muted p-0"
                                            title="Modifica"
                                            onClick={() => {
                                                navigate(`/project/economic_offert/edit/${encodeURIComponent(p.preventivo_uid)}`)
                                            }

                                            }
                                        >
                                            <MDBIcon fas icon="pen" />
                                        </MDBBtn>
                                        <MDBBtn
                                            size="sm"
                                            color="link"
                                            className="text-muted p-0"
                                            title="Elimina"
                                        >
                                            <MDBIcon fas icon="trash" />
                                        </MDBBtn>
                                    </div>
                                </MDBCardBody>
                            ))}
                        </MDBCard>
                    </MDBRow>
                    {/* Modal Create */}
                    <MDBModal tabIndex="-1" open={modalOpen} setOpen={setModalOpen}>
                        <MDBModalDialog centered size="lg">
                            <MDBModalContent>
                                <MDBModalHeader>
                                    <MDBModalTitle>Nuovo Preventivo</MDBModalTitle>
                                    <MDBBtn className="btn-close" color="none" onClick={toggleModal}></MDBBtn>
                                </MDBModalHeader>
                                <MDBModalBody className="mx-3">
                                    <GeneralForm<EstimateInfo, { project_uid: string }>
                                        params={{ project_uid }}
                                        mode="create"
                                        fields={Product_FormFields}
                                        createData={async (data) => {
                                            console.log("Mock createData chiamata con:", data);
                                            return Promise.resolve({
                                                data: {
                                                    project_uid: "",
                                                    preventivo_uid: "",
                                                    customer_uid: "",
                                                    tipo: "",
                                                    fiera: "",
                                                    stato: "",
                                                    validitaFino: "",
                                                    descrizione: "",
                                                    titolo: "",
                                                    importo: "",
                                                    note: "",
                                                },
                                                response: {
                                                    success: true,
                                                    message: "Richiesta simulata completata con successo",
                                                },
                                            });
                                        }}
                                        createBtnProps={{
                                            label: "Salva  Nuovo Prodotto",
                                            labelSaving: "Salvataggio in corso",
                                        }}
                                        onSuccess={(created) => {
                                            console.log('Creato:', created);
                                            // setPreventivoUid(created.)
                                        }}
                                    />


                                </MDBModalBody>
                            </MDBModalContent>
                        </MDBModalDialog>
                    </MDBModal>
                </MDBContainer >
            ) : (

                <OffertaEconomicaEdit
                    preventivo_uid={preventivo_uid}
                />
            )}
        </>
    );
};


export default OffertaEconomica;