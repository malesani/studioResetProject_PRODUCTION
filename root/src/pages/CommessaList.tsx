import React, { useState } from "react";
import {
    MDBContainer,
    MDBCard,
    MDBCardBody,
    MDBCollapse,
    MDBBadge,
    MDBRow,
    MDBCol,
    MDBInputGroup,
    MDBInput,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem,
    MDBBtn,
    MDBIcon,
} from "mdb-react-ui-kit";

const CommesseList: React.FC = () => {
    const [tuttiAperti, setTuttiAperti] = useState(false);
    const [aperto, setAperto] = useState(false);
    const [raggruppaCliente, setRaggruppaCliente] = useState(true);
    const [vista, setVista] = useState<"grid" | "list">("list");


    const toggleCollapse = () => setAperto(!aperto);

    const handleExpandAll = () => {
        setAperto(true);
        setTuttiAperti(true);
    };

    const handleCollapseAll = () => {
        setAperto(false);
        setTuttiAperti(false);
    };

    const totaleClienti = 1;

    const cliente = {
        nome: "Azienda prova 6",
        email: "test.6@stsmai.com",
        commesseTotali: 1,
        importoTotale: "0,00 €",
        stats: {
            attive: 1,
            inCorso: 0,
            completate: 0,
            annullate: 0,
        },
        commesse: [
            {
                titolo: "Commessa:",
                codice: "com20250710PONSAL",
                preventivo: "-",
                fiera: "-",
                stato: "Attiva",
                priorita: "Media",
                importo: "0,00 €",
                accettazione: "10/07/2025",
                inizio: "10/07/2025",
            },
        ],
    };

    return (
        <MDBContainer className="py-4">
            <MDBRow className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold">Gestione Commesse</h3>
                        <p className="text-muted mb-0">
                            Gestisci tutte le commesse e progetti del sistema
                        </p>
                    </div>
                </div>
            </MDBRow>
            <MDBRow
                className="align-items-center bg-white p-3 rounded-2 border mb-4 g-2"
                style={{ fontSize: "0.9rem" }}
            >
                {/* 🔍 Campo di ricerca */}
                <MDBCol md="3">
                    <MDBInputGroup>
                        <span className="input-group-text bg-white border-end-0">
                            <MDBIcon fas icon="search" />
                        </span>
                        <MDBInput
                            type="text"
                            placeholder="Cerca commesse..."
                            className="border-start-0"
                        />
                    </MDBInputGroup>
                </MDBCol>

                {/* 🟢 Filtro stato */}
                <MDBCol md="2">
                    <MDBDropdown className="w-100">
                        <MDBDropdownToggle color="light" className="w-100 text-start">
                            Tutti gli stati
                        </MDBDropdownToggle>
                        <MDBDropdownMenu>
                            <MDBDropdownItem link>Attive</MDBDropdownItem>
                            <MDBDropdownItem link>In corso</MDBDropdownItem>
                            <MDBDropdownItem link>Completate</MDBDropdownItem>
                            <MDBDropdownItem link>Annullate</MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </MDBCol>

                {/* 🟠 Filtro priorità */}
                <MDBCol md="4">
                    <MDBDropdown className="w-100">
                        <MDBDropdownToggle color="light" className="w-100 text-start">
                            Tutte le priorità
                        </MDBDropdownToggle>
                        <MDBDropdownMenu>
                            <MDBDropdownItem link>Bassa</MDBDropdownItem>
                            <MDBDropdownItem link>Media</MDBDropdownItem>
                            <MDBDropdownItem link>Alta</MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </MDBCol>

                {/* 👥 Raggruppa per cliente 
                <MDBCol md="2">
                    <MDBBtn
                        outline={!raggruppaCliente}
                        color={raggruppaCliente ? "primary" : "light"}
                        onClick={() => setRaggruppaCliente(!raggruppaCliente)}
                        className="w-100 d-flex align-items-center justify-content-center"
                        style={{
                            backgroundColor: raggruppaCliente ? "#eaf2ff" : "#fff",
                            color: raggruppaCliente ? "#2563eb" : "#495057",
                            borderColor: raggruppaCliente ? "#cdddfc" : "#dee2e6",
                        }}
                    >
                        <MDBIcon fas icon="users" className="me-2" />
                        Raggruppa per cliente
                    </MDBBtn>
                </MDBCol>
*/}
                {/* 🧭 Vista + Azioni */}
                <MDBCol
                    md="3"
                    className="d-flex justify-content-end align-items-center flex-wrap gap-2"
                >
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


            <MDBRow className="align-items-center mb-3">
                <MDBCol>
                    <h6 className="fw-semibold mb-0 text-dark">
                        {totaleClienti}{" "}
                        {totaleClienti === 1 ? "cliente" : "clienti"} con commesse
                    </h6>
                </MDBCol>

                <MDBCol className="text-end">
                    <button
                        className="btn btn-link text-primary text-decoration-none p-0 me-3"
                        onClick={handleExpandAll}
                        style={{ fontWeight: 500 }}
                    >
                        Espandi tutti
                    </button>
                    <button
                        className="btn btn-link text-primary text-decoration-none p-0"
                        onClick={handleCollapseAll}
                        style={{ fontWeight: 500 }}
                    >
                        Comprimi tutti
                    </button>
                </MDBCol>
            </MDBRow>

            {/* 🔹 CARD CLIENTE */}
            <MDBCard
                className="border rounded-2 mb-3"
                style={{
                    overflow: "hidden",
                }}
            >
                {/* HEADER CLIENTE */}
                <MDBCardBody
                    onClick={toggleCollapse}
                    className="d-flex justify-content-between align-items-center"
                    style={{
                        backgroundColor: "#f3f7ff",
                        cursor: "pointer",
                        transition: "background 0.2s ease",
                    }}
                >
                    {/* Cliente info */}
                    <div className="d-flex align-items-center">
                        <div
                            className="rounded-2 d-flex justify-content-center align-items-center text-primary me-3"
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#e2ebff",
                            }}
                        >
                            <MDBIcon fas icon="building" />
                        </div>
                        <div>
                            <p className="fw-bold mb-0 text-dark">{cliente.nome}</p>
                            <p className="text-muted small mb-0">
                                <MDBIcon fas icon="envelope" className="me-1" />
                                {cliente.email}
                            </p>
                        </div>
                    </div>

                    {/* Stats e importo */}
                    <div className="d-flex align-items-center gap-4">
                        <div className="small text-muted">
                            <span className="me-3 text-primary">
                                <MDBIcon fas icon="square" size="xs" className="me-1" />
                                {cliente.stats.attive} attive
                            </span>
                            <span className="me-3 text-warning">
                                <MDBIcon fas icon="square" size="xs" className="me-1" />
                                {cliente.stats.inCorso} in corso
                            </span>
                            <span className="me-3 text-success">
                                <MDBIcon fas icon="square" size="xs" className="me-1" />
                                {cliente.stats.completate} completate
                            </span>
                            <span className="text-danger">
                                <MDBIcon fas icon="square" size="xs" className="me-1" />
                                {cliente.stats.annullate} annullate
                            </span>
                        </div>

                        <div className="text-end">
                            <p className="small mb-0 text-muted">
                                {cliente.commesseTotali} commesse
                            </p>
                            <p className="fw-bold text-warning mb-0">
                                {cliente.importoTotale}
                            </p>
                        </div>

                        {/* Icona toggle */}
                        <MDBIcon
                            fas
                            icon={aperto ? "chevron-up" : "chevron-down"}
                            className="text-muted"
                        />
                    </div>
                </MDBCardBody>

                {/* COLLAPSE */}
                <MDBCollapse open={aperto}>
                    {/* Header Grid */}
                    <div
                        className="d-grid fw-semibold text-muted px-3 py-2 border-bottom"
                        style={{
                            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 0.8fr",
                            fontSize: "0.85rem",
                            backgroundColor: "#fff8f0",
                        }}
                    >
                        <div>TITOLO</div>
                        <div>PREVENTIVO</div>
                        <div>FIERA</div>
                        <div>STATO</div>
                        <div>PRIORITÀ</div>
                        <div>IMPORTO</div>
                        <div>DATE</div>
                    </div>

                    {/* Lista commesse */}
                    {cliente.commesse.map((c, i) => (
                        <div
                            key={i}
                            className="d-grid align-items-center px-3 py-3"
                            style={{
                                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 0.8fr",
                                borderBottom: "1px solid #f0f0f0",
                                backgroundColor: i % 2 === 0 ? "#fff" : "#fcfcfc",
                            }}
                        >
                            {/* Titolo */}
                            <div className="d-flex align-items-center">
                                <div
                                    className="rounded-2 d-flex justify-content-center align-items-center text-warning me-3"
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        backgroundColor: "rgba(250,159,107,0.15)",
                                    }}
                                >
                                    <MDBIcon fas icon="briefcase" />
                                </div>
                                <div>
                                    <p className="fw-bold mb-0">{c.titolo}</p>
                                    <p className="text-muted small mb-0">{c.codice}</p>
                                </div>
                            </div>

                            {/* Preventivo */}
                            <div>{'PREV-20250710-00011'}</div>

                            {/* Fiera */}
                            <div>{'HOMI'}</div>

                            {/* Stato */}
                            <div>
                                <MDBBadge color="primary" light pill >
                                    <MDBIcon fas icon="clock" className="me-1" /> {c.stato}
                                </MDBBadge>
                            </div>

                            {/* Priorità */}
                            <div>
                                <MDBBadge color="warning" light pill >
                                    <MDBIcon fas icon="flag" className="me-1" /> {c.priorita}
                                </MDBBadge>
                            </div>

                            {/* Importo */}
                            <div className="fw-bold text-dark">{c.importo}</div>

                            {/* Date */}
                            <div className="text-muted small">
                                <div>
                                    Accettazione: <strong>{c.accettazione}</strong>
                                </div>
                                <div>Inizio: {c.inizio}</div>
                            </div>
                        </div>
                    ))}
                </MDBCollapse>
            </MDBCard>
        </MDBContainer>
    );
};

export default CommesseList;
