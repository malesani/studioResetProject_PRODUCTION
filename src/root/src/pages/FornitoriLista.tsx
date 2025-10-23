
import React, { useState } from "react";
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
    MDBTable,
    MDBTableHead,
    MDBTableBody,
    MDBBadge,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalHeader,
    MDBModalTitle

} from "mdb-react-ui-kit";

import { GeneralForm, FieldConfig } from '../app_components/GeneralForm';


const cards = [
    {
        title: "Fornitori Totali",
        value: 4,
        color: "success",
        icon: "users"
    },
    {
        title: "Fornitori Attivi",
        value: 4,
        color: "primary",
        icon: "building"
    },
    {
        title: "Settori Diversi",
        value: 0,
        color: "purple",
        icon: "globe"
    },
    {
        title: "Risultati Filtrati",
        value: 4,
        color: "warning",
        icon: "hashtag"
    }
];

const fornitori = [
    {
        ragioneSociale: "Caffè Milano S.r.l.",
        indirizzo: "Via Dante Alighieri 12",
        citta: "Milano",
        cap: "20121",
        paese: "Italia",
        email: "info@caffemilano.it",
        website: "https://www.caffemilano.it",
        partitaIVA: "12345678901",
        settore: "Alimentare e Bevande",
        stato: "Attivo",
        numeroTelefonico: "+39 02 5551 2233",
        note: "Fornitore principale di caffè per eventi fieristici",
    },
    {
        ragioneSociale: "TechVision Consulting S.p.A.",
        indirizzo: "Corso Italia 89",
        citta: "Torino",
        cap: "10121",
        paese: "Italia",
        email: "sales@techvision.it",
        website: "https://www.techvision.it",
        partitaIVA: "09876543210",
        settore: "Tecnologia e Consulenza IT",
        stato: "Attivo",
        numeroTelefonico: "+39 011 6678 992",
        note: "Partner tecnologico per la gestione delle fiere digitali",
    },
    {
        ragioneSociale: "GreenDesign Studio S.r.l.",
        indirizzo: "Via Garibaldi 45",
        citta: "Bologna",
        cap: "40126",
        paese: "Italia",
        email: "contatti@greendesign.it",
        website: "https://www.greendesign.it",
        partitaIVA: "11223344556",
        settore: "Arredamento e Design",
        stato: "Attivo",
        numeroTelefonico: "+39 051 7789 005",
        note: "Fornitore di stand ecologici e sostenibili per esposizioni",
    },
];


interface FormFornitori {
    ragioneSociale: string,
    indirizzo: string,
    citta: string,
    cap: string,
    paese: string,
    email: string,
    website: string,
    partitaIVA: string,
    settore: string,
    stato: string,
    numeroTelefonico: string,
    note: string

}

export interface ObjectivesListProps {
    project_uid: string;
}

const Fornitori_FormFields: FieldConfig<FormFornitori>[] = [
    {
        name: "ragioneSociale", label: "Ragione Sociale", required: true, type: "text", grid: { md: 12 },
        extraElements: [
            {
                position: "before", grid: { md: 12 },
                element: () => {
                    return <>
                        <MDBIcon fas icon="building" className="me-3" />
                        <h5 className="fs-8 fw-lighter d-inline test">
                            Dati Amministrativi
                        </h5>
                    </>;
                }
            }
        ]
    },
    {
        name: "indirizzo", label: "Indirizzo", required: true, type: "text", grid: { md: 12 },
    },
    {
        name: "citta", label: "Citta", required: true, type: "text", grid: { md: 6 },
    },
    {
        name: "cap", label: "Cap", required: true, type: "text", grid: { md: 6 },
    },
    {
        name: "paese", label: "Paese", required: true, type: "text", grid: { md: 6 },
    },
    {
        name: "email", label: "Email", required: true, type: "text", grid: { md: 6 },
    },
    {
        name: "website", label: "Website", required: true, type: "text", grid: { md: 6 },
    },
    {
        name: "partitaIVA", label: "Partita IVA", required: true, type: "text", grid: { md: 6 },
    },

    {
        name: "settore", label: "Settore", required: true, type: "text", grid: { md: 6 },
    },

    {
        name: "stato", label: "Stato", required: true, type: "selectbox", grid: { md: 6 },
        options: [
            { text: "attivo", value: "attivo" },
            { text: "inattivo", value: "inattivo" },
        ]
    },
    {
        name: "numeroTelefonico", label: "Numero Telefonico", required: true, type: "text", grid: { md: 6 },
        extraElements: [
            {
                position: "before", grid: { md: 12 },
                element: () => {
                    return <>
                        <MDBIcon fas icon="user" className="me-3" />
                        <h5 className="fs-8 fw-lighter d-inline test">
                            Contatti
                        </h5>
                    </>;
                }
            }
        ]
    },
    {
        name: "note", label: "Note", type: "text_area", grid: { md: 12 },
    },


]

const FornitoriLista: React.FC<ObjectivesListProps> = ({ project_uid }) => {

    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const toggleModal = () => setModalOpen(!modalOpen);

    return (
        <MDBContainer className="py-4">
            <MDBRow className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold">Gestione Fornitori</h3>
                        <p className="text-muted mb-0">
                            Gestisci tutti i fornitori del sistema
                        </p>
                    </div>
                    <MDBBtn onClick={toggleModal} color="success">
                        <MDBIcon fas icon="plus" className="me-2" /> Nuovo Fornitore
                    </MDBBtn>
                </div>
            </MDBRow>

            <MDBRow className="g-3 mb-4">
                {cards.map((card, index) => (
                    <MDBCol md="3" key={index}>
                        <MDBCard
                            className={`border-${card.color} bg-${card.color}-subtle text-${card.color}`}
                        >
                            <MDBCardBody className="d-flex align-items-center">
                                <div
                                    className={`p-3 bg-${card.color}-light rounded me-3 d-flex align-items-center justify-content-center`}
                                    style={{
                                        backgroundColor: `rgba(var(--mdb-${card.color}-rgb), 0.15)`,
                                        width: "45px",
                                        height: "45px",
                                    }}
                                >
                                    <MDBIcon fas icon={card.icon} size="lg" />
                                </div>
                                <div>
                                    <p className="fw-bold mb-0">{card.title}</p>
                                    <h4 className="fw-bold mb-0">{card.value}</h4>
                                </div>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                ))}
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
                            placeholder="Cerca fornitori per nome, email, città o settore..."
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
                            <MDBDropdownItem link>Attivi</MDBDropdownItem>
                            <MDBDropdownItem link>Inattivi</MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </MDBCol>

                {/* Filtro settore */}
                <MDBCol xs="6" md="3" lg="2">
                    <MDBDropdown className="w-100">
                        <MDBDropdownToggle color="light" className="w-100 text-start">
                            Tutti i settori
                        </MDBDropdownToggle>
                        <MDBDropdownMenu>
                            <MDBDropdownItem link>Commercio</MDBDropdownItem>
                            <MDBDropdownItem link>Servizi</MDBDropdownItem>
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

            <MDBRow className="mb-4">
                <MDBCol>
                    <MDBCard className="border rounded-2 bg-white">
                        {/* 🔹 Encabezado */}
                        <div
                            className="d-grid fw-semibold text-muted px-3 py-3 border-bottom"
                            style={{
                                gridTemplateColumns:
                                    "2.5fr 2fr 1.5fr 1fr 1fr 0.8fr 1fr",
                                fontSize: "0.9rem",

                            }}
                        >
                            <div className="text-dark">
                                <MDBIcon fas icon="truck" className="me-2 text-success" />
                                Nome Fornitore
                            </div>
                            <div>
                                <MDBIcon fas icon="envelope" className="me-2 text-success" />
                                Contatti
                            </div>
                            <div>
                                <MDBIcon fas icon="map-marker-alt" className="me-2 text-success" />
                                Ubicazione
                            </div>
                            <div>
                                <MDBIcon fas icon="building" className="me-2 text-success" />
                                Settore
                            </div>
                            <div>
                                <MDBIcon fas icon="file-invoice" className="me-2 text-success" />
                                P.IVA
                            </div>
                            <div>
                                <MDBIcon fas icon="toggle-on" className="me-2 text-success" />
                                Stato
                            </div>

                            <div>
                                <MDBIcon fas icon="cogs" className="me-2 text-success" />
                                Azioni
                            </div>
                        </div>

                        {/* 🔹 Filas tipo grid */}
                        {fornitori.map((f, i) => (
                            <div
                                key={i}
                                className="d-grid align-items-center px-3 py-3"
                                style={{
                                    gridTemplateColumns:
                                        "2.5fr 2fr 1.5fr 1fr 1fr 0.8fr 1fr",
                                    borderBottom: "1px solid #f0f0f0",
                                    backgroundColor: i % 2 === 0 ? "#fff" : "#fcfcfc",
                                }}
                            >
                                {/* Nome Fornitore */}
                                <div className="d-flex align-items-center">
                                    <div
                                        className="rounded-2 d-flex justify-content-center align-items-center fw-bold text-success me-3"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            backgroundColor: "rgba(25, 135, 84, 0.15)",
                                        }}
                                    >
                                        {f.ragioneSociale.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="fw-bold mb-0">{f.ragioneSociale}</p>
                                    </div>
                                </div>

                                {/* Contatti */}
                                <div>
                                    {f.email && (
                                        <p className="mb-0">
                                            <MDBIcon fas icon="envelope" className="me-2 text-muted" />
                                            {f.email}
                                        </p>
                                    )}
                                    {f.numeroTelefonico && (
                                        <p className="mb-0">
                                            <MDBIcon fas icon="phone" className="me-2 text-muted" />
                                            {f.numeroTelefonico}
                                        </p>
                                    )}
                                </div>

                                {/* Ubicazione */}
                                <div>
                                    <p className="fw-bold mb-0">{f.citta || "-"}</p>
                                    <p className="text-muted small mb-0">{f.indirizzo}</p>
                                </div>

                                {/* Settore */}
                                <div className="text-muted">
                                    {f.settore || "Non specificato"}
                                </div>

                                {/* P.IVA */}
                                <div className="text-muted">
                                    {f.partitaIVA || "Non specificata"}
                                </div>

                                {/* Stato */}
                                <div>
                                    <MDBBadge color="success" light>
                                        <MDBIcon fas icon="square" className="me-1" /> {f.stato}
                                    </MDBBadge>
                                </div>


                                {/* Azioni */}
                                <div className="d-flex gap-2">
                                    <MDBBtn color="link" size="sm" className="text-success p-0">
                                        <MDBIcon fas icon="pen" />
                                    </MDBBtn>
                                    <MDBBtn color="link" size="sm" className="text-danger p-0">
                                        <MDBIcon fas icon="trash" />
                                    </MDBBtn>
                                </div>
                            </div>
                        ))}
                    </MDBCard>
                </MDBCol>
            </MDBRow>

            <MDBModal tabIndex="-1" open={modalOpen} setOpen={setModalOpen}>
                <MDBModalDialog centered size="lg">
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>Nuovo Fornitore</MDBModalTitle>
                            <MDBBtn className="btn-close" color="none" onClick={toggleModal}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody className="mx-3">
                            <div className="row g-3">

                                <GeneralForm<FormFornitori, { project_uid: string }>
                                    params={{ project_uid }}
                                    mode="create"
                                    fields={Fornitori_FormFields}
                                    createData={async (data) => {
                                        console.log("Mock createData chiamata con:", data);
                                        return Promise.resolve({
                                            data: {
                                                ragioneSociale: data.ragioneSociale,
                                                indirizzo: data.indirizzo,
                                                citta: data.citta,
                                                cap: data.cap,
                                                paese: data.paese,
                                                email: data.email,
                                                website: data.website,
                                                partitaIVA: data.partitaIVA,
                                                settore: data.settore,
                                                stato: data.stato,
                                                numeroTelefonico: data.numeroTelefonico,
                                                note: data.note
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
                                        fornitori.push(created)
                                    }}
                                />

                            </div>
                        </MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>


        </MDBContainer>
    );
};


export default FornitoriLista;