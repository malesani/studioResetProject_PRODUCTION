
import React, { useState } from "react";
import { GeneralForm, FieldConfig } from '../app_components/GeneralForm';
import {
    MDBContainer,
    MDBRow,
    MDBIcon,
    MDBBtn,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBBadge,
    MDBInputGroup,
    MDBInput,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalHeader,
    MDBModalTitle
} from "mdb-react-ui-kit";



const fiere = [
    {
        nomeFiera: "Host Milano 2025",
        start_date: "2025-10-17",
        end_date: "2025-10-21",
        // giorni: 5,
        location: "Milano, Italia",
        sector: "Hospitality e Ristorazione",
        state: "In Corso",
    },
    {
        nomeFiera: "MIDO Eyewear Show",
        start_date: "2025-02-01",
        end_date: "2025-02-03",
        // giorni: 3,
        location: "Fiera Milano, Italia",
        sector: "Ottica e Moda",
        state: "Completata",
    },
    {
        nomeFiera: "EIMA International 2026",
        start_date: "2026-02-12",
        end_date: "2026-02-16",
        location: "Bologna, Italia",
        sector: "Macchinari Agricoli",
        state: "Programmato",
        // giorni: 5,
    },
];


interface FieraForm {
    nomeFiera: string,
    start_date: string,
    end_date: string,
    sector: string,
    location: string,
    state: 'active' | 'canceled',
    website: string,
    description: string,
    note: string,
}

export interface ObjectivesListProps {
    project_uid: string;
}

const FieraLista: React.FC<ObjectivesListProps> = ({ project_uid }) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<"griglia" | "cards">("griglia");

    const Fiera_FormFields: FieldConfig<FieraForm>[] = [
        {
            name: "nomeFiera", label: "Inserisci il nome della Fiera", required: true, type: "text", grid: { md: 12 },
            extraElements: [
                {
                    position: "before", grid: { md: 6 },
                    element: () => {
                        return <>
                            <MDBIcon fas icon="campground" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline test">
                                Nome Fiera
                            </h5>
                        </>;
                    }
                }
            ]
        },
        {
            name: "start_date", label: "Data di inizio", required: true, type: "text", grid: { md: 6 },
            extraElements: [
                {
                    position: "before", grid: { md: 12 },
                    element: () => {
                        return <>
                            <MDBIcon fas icon="calendar" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline test">
                                Periodo Fiera
                            </h5>
                        </>;
                    }
                }
            ]
        },
        {
            name: "end_date", label: "Data di fine", required: true, type: "text", grid: { md: 6 },
        },
        {
            name: "location", label: "location", required: true, type: "text", grid: { md: 4 },
            extraElements: [
                {
                    position: "before", grid: { md: 12 },
                    element: () => {
                        return <>
                            <MDBIcon fas icon="people-carry" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline test">
                                Informazioni Operative
                            </h5>
                        </>;
                    }
                }
            ]
        },
        {
            name: "sector", label: "Settore", required: true, type: "text", grid: { md: 4 },
        },
        {
            name: "state", label: "Stato", required: true, type: "selectbox", grid: { md: 4 },
            options: [
                { text: "Programmata", value: "active" },
                { text: "Annullata", value: "cancelled" },
            ]
        },
        {
            name: "website", label: "Sito Web", type: "text", grid: { md: 12 },
            extraElements: [
                {
                    position: "before", grid: { md: 12 },
                    element: () => {
                        return <>
                            <MDBIcon fas icon="plus-square" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline test">
                                Informazioni Aggiuntive
                            </h5>
                        </>;
                    }
                }
            ]
        },
        {
            name: "description", label: "Descrizione", type: "text_area", grid: { md: 12 },
        },
        {
            name: "note", label: "Note",  type: "text_area", grid: { md: 12 },
        },

    ]


    const toggleModal = () => setModalOpen(!modalOpen);

    return (
        <MDBContainer className="py-4">
            <MDBRow className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold">Gestione Fiere</h3>
                        <p className="text-muted mb-0">
                            Gestisci tutte le fiere ed eventi del sistema
                        </p>
                    </div>
                    <MDBBtn onClick={toggleModal} color="success">
                        <MDBIcon fas icon="plus" className="me-2" /> Nuova Fiera
                    </MDBBtn>
                </div>
            </MDBRow>

            <MDBRow className="align-items-center bg-white p-3 rounded-2 border mb-4 g-2">
                {/* 🔍 Campo di ricerca */}
                <MDBCol xs="12" md="6" lg="2">
                    <MDBInputGroup className="w-100">
                        <span className="input-group-text bg-white border-end-0">
                            <MDBIcon fas icon="search" />
                        </span>
                        <MDBInput
                            type="text"
                            placeholder="Cerca fiere..."
                            className="border-start-0"
                        />
                    </MDBInputGroup>
                </MDBCol>

                {/* 🔜 Fiere future */}
                <MDBCol xs="4" md="3" lg="2">
                    <MDBBtn color="light" className="w-100 d-flex align-items-center justify-content-center">
                        <MDBIcon fas icon="arrow-right" className="me-2" />
                        Fiere future
                    </MDBBtn>
                </MDBCol>

                {/* 🔽 Filtro state */}
                <MDBCol xs="4" md="3" lg="2">
                    <MDBDropdown className="w-100">
                        <MDBDropdownToggle color="light" className="w-100 text-start">
                            Tutti gli stati
                        </MDBDropdownToggle>
                        <MDBDropdownMenu>
                            <MDBDropdownItem link>Pianificata</MDBDropdownItem>
                            <MDBDropdownItem link>In Corso</MDBDropdownItem>
                            <MDBDropdownItem link>Completata</MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </MDBCol>

                {/* 🔽 Filtro sector */}
                <MDBCol xs="4" md="6" lg="2">
                    <MDBDropdown className="w-100">
                        <MDBDropdownToggle color="light" className="w-100 text-start">
                            Tutti i settori
                        </MDBDropdownToggle>
                        <MDBDropdownMenu>
                            <MDBDropdownItem link>Arredamento</MDBDropdownItem>
                            <MDBDropdownItem link>Moda</MDBDropdownItem>
                            <MDBDropdownItem link>Alimentazione</MDBDropdownItem>
                            <MDBDropdownItem link>Packaging</MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </MDBCol>

                {/* 👁️‍🗨️ Icone visualizzazione + Esporta / Importa */}
                <MDBCol xs="12" md="6" lg="4" className="d-flex justify-content-end flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                        {/* Iconi vista */}
                        <MDBBtn
                            color="light"
                            className="px-3"
                            title={viewMode === "griglia" ? "Vista cards" : "Vista griglia"}
                            onClick={() => setViewMode(viewMode === "griglia" ? "cards" : "griglia")}
                        >
                            <MDBIcon fas icon={viewMode === "griglia" ? "list" : "th-large"} />
                        </MDBBtn>

                        <MDBBtn color="light" className="px-3" title="Vista calendario">
                            <MDBIcon fas icon="calendar-alt" />
                        </MDBBtn>

                        {/* Bottoni Esporta / Importa */}
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

            {viewMode === "griglia" ? (
                // ======== VISTA GRIGLIA =========
                <MDBCard className="border rounded-2 bg-white">
                    <div
                        className="d-grid fw-semibold text-muted px-3 py-3 bg-light"
                        style={{
                            gridTemplateColumns:
                                // "2fr 1fr 1fr 0.7fr 2fr 2fr 1.5fr",
                                "2fr 1fr 0.7fr 2fr 2fr 1.5fr",
                            fontSize: "0.9rem",
                        }}
                    >
                        <div>NOME</div>
                        <div><MDBIcon fas icon="calendar-day" className="me-2" />DAL</div>
                        <div><MDBIcon fas icon="calendar-check" className="me-2" />AL</div>
                        {/* <div><MDBIcon fas icon="clock" className="me-2" />GIORNI</div> */}
                        <div><MDBIcon fas icon="map-marker-alt" className="me-2" />LOCALITÀ</div>
                        <div><MDBIcon fas icon="tags" className="me-2" />SETTORE</div>
                        <div><MDBIcon fas icon="calendar-alt" className="me-2" />STATO</div>
                    </div>

                    {fiere.map((fiera, i) => (
                        <MDBCardBody
                            key={i}
                            className="d-grid align-items-center px-3 py-3"
                            style={{
                                gridTemplateColumns:
                                    // "2fr 1fr 1fr 0.7fr 2fr 2fr 1.5fr",
                                    "2fr  1fr 0.7fr 2fr 2fr 1.5fr",
                                borderBottom: "1px solid #f0f0f0",
                                backgroundColor: i % 2 === 0 ? "#fff" : "#fafbfc",
                            }}
                        >
                            <div className="fw-bold text-dark">{fiera.nomeFiera}</div>
                            <div>{fiera.start_date}</div>
                            <div>{fiera.end_date}</div>
                            {/* <div className="fw-bold text-primary">{fiera.giorni}</div> */}
                            <div><MDBIcon fas icon="map-marker-alt" className="me-2 text-secondary" />{fiera.location}</div>
                            <div>{fiera.sector}</div>
                            <div><MDBBadge color="info" className="px-2 py-2 fw-semibold text-white">{fiera.state}</MDBBadge></div>
                        </MDBCardBody>
                    ))}
                </MDBCard>
            ) : (
                // ======== VISTA CARDS =========
                <MDBRow className="g-3">
                    {fiere.map((fiera, i) => (
                        <MDBCol key={i} md="6" lg="4">
                            <MDBCard className="h-100 shadow-sm">
                                <MDBCardBody>
                                    <h5 className="fw-bold mb-2">{fiera.nomeFiera}</h5>
                                    <p className="text-muted mb-1">
                                        <MDBIcon fas icon="calendar" className="me-2" />
                                        {/* {fiera.start_date} → {fiera.end_date} ({fiera.giorni} giorni) */}
                                    </p>
                                    <p className="mb-1">
                                        <MDBIcon fas icon="map-marker-alt" className="me-2 text-secondary" />
                                        {fiera.location}
                                    </p>
                                    <p className="mb-1">
                                        <MDBIcon fas icon="tags" className="me-2 text-secondary" />
                                        {fiera.sector}
                                    </p>
                                    <MDBBadge color="info" className="mt-2 text-white">{fiera.state}</MDBBadge>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                    ))}
                </MDBRow>
            )}

            <MDBModal tabIndex="-1" open={modalOpen} setOpen={setModalOpen}>
                <MDBModalDialog centered size="lg">
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>Nuovo Fiera</MDBModalTitle>
                            <MDBBtn className="btn-close" color="none" onClick={toggleModal}></MDBBtn>
                        </MDBModalHeader>

                        <MDBModalBody className="mx-3">
                            <div className="row g-3">

                                <GeneralForm<FieraForm, { project_uid: string }>
                                    params={{ project_uid }}
                                    mode="create"
                                    fields={Fiera_FormFields}
                                    createData={async (data) => {
                                        console.log("Mock createData chiamata con:", data);
                                        return Promise.resolve({
                                            data: {
                                                nomeFiera: data.nomeFiera,
                                                start_date: data.start_date,
                                                end_date: data.end_date,
                                                location: data.location,
                                                sector: data.sector,
                                                state: data.state,
                                                website: data.website,
                                                description: data.description,
                                                note: data.note,
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
                                      fiere.push(created)
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


export default FieraLista;