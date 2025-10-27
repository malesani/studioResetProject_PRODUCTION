import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import General_Loading from "../app_components/General_Loading";
import { GeneralForm, FieldConfig, SelectData } from "../app_components/GeneralForm";
import Pagination from "../app_components/TableData/components/Pagination";
import { TableFilters } from "../app_components/TableData/interfaces";

import { predefinedObjectives } from "../components/preventivi/preventivi";

import {
    EstimateInfo,
    get_estimatesListPaginated,
    create_estimate
} from "../api_module/estimates/EstimatesRequest";


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
    MDBModalTitle,
    MDBTable,
    MDBTableHead,
    MDBTableBody,
    MDBBtnGroup,
} from "mdb-react-ui-kit";

export interface ObjectivesListProps {
    project_uid: string;
}

type StatiPreventivo = "Bozza" | "Inviato" | "Accettato" | "Rifiutato" | string;

type EstimatesFilters = TableFilters<EstimateInfo> & {
    stato?: StatiPreventivo | "";
    tipo?: string | "";
};

const moneyFmt = (n: number | string | undefined) => {
    const num = typeof n === "number" ? n : parseFloat((n ?? "0").toString().replace(",", "."));
    if (Number.isNaN(num)) return "0,00 €";
    return num
        .toLocaleString("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 })
        .replace("EUR", "€");
};

const EstimatesList: React.FC<ObjectivesListProps> = ({ project_uid }) => {
    const navigate = useNavigate();

    // ---------------- UI State ----------------
    const [loadingPage, setLoadingPage] = useState<boolean>(false);
    const [errorPage, setErrorPage] = useState<string | null>(null);

    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const toggleCreateModal = () => setCreateModalOpen((o) => !o);

    // ---------------- Data ----------------
    const [estimates, setEstimates] = useState<EstimateInfo[]>([]);

    // Filtri/paginazione (stile MaterialiList)
    const [filters, setFilters] = useState<EstimatesFilters>({
        page: 1,
        per_page: 25,
        search: "",
        stato: "",
        tipo: "",
    });

    const [searchDraft, setSearchDraft] = useState<string>(filters.search ?? "");

    // Debounce searchDraft → filters.search
    useEffect(() => {
        const t = setTimeout(() => {
            setFilters((prev) => ({ ...prev, page: 1, search: searchDraft }));
        }, 400);
        return () => clearTimeout(t);
    }, [searchDraft]);

    const setCurrentPage = (page: number) => setFilters((prev) => ({ ...prev, page }));
    const setRowsForPage = (per_page: number) => setFilters((prev) => ({ ...prev, per_page, page: 1 }));

    const handleSelectStato = (value: string) => setFilters((prev) => ({ ...prev, page: 1, stato: value }));
    const handleSelectTipo = (value: string) => setFilters((prev) => ({ ...prev, page: 1, tipo: value }));

    // ---------------- Fetch (stile MaterialiList) ----------------
    const [loadingList, setLoadingList] = useState<boolean>(false);
    const [errorList, setErrorList] = useState<string | null>(null);

    const fetchEstimatesOnDemand = async () => {
        setLoadingList(true);
        setErrorList(null);
        try {
            const args = {
                search: filters.search ?? "",
                page: filters.page ?? 1,
                per_page: filters.per_page ?? 25,
                stato: filters.stato || undefined,
                tipo: filters.tipo || undefined,
                project_uid,
            } as any; // adatta il contratto all'API reale

            const response = await get_estimatesListPaginated(args);
            if (response.success) {
                setEstimates(response.data!.rows);
                // TODO: se il backend ritorna meta.pages_num, usalo sotto nel Pagination
            } else {
                setErrorList(response.message || "Errore nel recupero preventivi");
            }
        } catch (err: any) {
            setErrorList(err.message || "Errore di rete");
        } finally {
            setLoadingList(false);
        }
    };

    // First splash load
    useEffect(() => {
        let isMounted = true;
        (async () => {
            setLoadingPage(true);
            setErrorPage(null);
            try {
                const args = {
                    search: filters.search ?? "",
                    page: filters.page ?? 1,
                    per_page: filters.per_page ?? 25,
                    stato: filters.stato || undefined,
                    tipo: filters.tipo || undefined,
                    project_uid,
                } as any;
                const response = await get_estimatesListPaginated(args);
                if (!isMounted) return;
                if (response.success) {
                    setEstimates(response.data!.rows);
                } else {
                    setErrorPage(response.message || "Errore generico");
                }
            } catch (err: any) {
                if (isMounted) setErrorPage(err.message || "Errore di rete");
            } finally {
                if (isMounted) setLoadingPage(false);
            }
        })();
        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refetch on filters change (after first render)
    const didInitRef = useRef(false);
    useEffect(() => {
        if (!didInitRef.current) {
            didInitRef.current = true;
            return;
        }
        fetchEstimatesOnDemand();
    }, [filters.search, filters.page, filters.per_page, filters.stato, filters.tipo]);

    // ---------------- Stats derivate ----------------
    const stats = useMemo(() => {
        const totali = estimates.length;
        const inviati = estimates.filter((e) => (e.stato || "").toLowerCase() === "inviato").length;
        const accettati = estimates.filter((e) => (e.stato || "").toLowerCase() === "accettato").length;
        const valoreTot = estimates.reduce((acc, e) => {
            const val = parseFloat((e.importo ?? "0").toString().replace(",", "."));
            return acc + (Number.isNaN(val) ? 0 : val);
        }, 0);
        return { totali, inviati, accettati, valoreTotale: moneyFmt(valoreTot) };
    }, [estimates]);

    // ---------------- Form Config ----------------
    const preventiviOptions: SelectData[] = predefinedObjectives.map((preventivo) => ({
        value: preventivo.preventivo_uid,
        text: preventivo.title,
        secondaryText: preventivo.description,
        icon: preventivo.icon,
    }));

    const CreateEstimate_Fields: FieldConfig<EstimateInfo>[] = [
        {
            name: "customer_uid",
            label: "Clienti",
            required: true,
            grid: { md: 12 },
            type: "selectbox",
            options: [
                { text: "Azienda Prova 1", value: "Azienda Prova 1" },
                { text: "Azienda Prova 3", value: "Azienda Prova 3" },
                { text: "Azienda Prova 4", value: "Azienda Prova 4" },
            ],
            properties: { multiple: false, hideChoseSomething: true },
            hrAfter: true,
            extraElements: [
                {
                    position: "before",
                    grid: { md: 12 },
                    element: (
                        <>
                            <MDBIcon fas icon="id-card" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">Seleziona cliente</h5>
                        </>
                    ),
                },
            ],
        },
        {
            name: "tipo",
            label: "Tipo Preventivo",
            required: true,
            grid: { md: 12 },
            type: "selectbox",
            customElementKey: "cards",
            options: preventiviOptions,
            properties: {
                multiple: false,
                showSummaryPills: true,
                hideChoseSomething: true,
                gridConfig: { md: 2, xl: 3, xxl: 4 },
            },
            extraElements: [
                {
                    position: "before",
                    grid: { md: 12 },
                    element: (
                        <>
                            <MDBIcon fas icon="file-signature" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">Tipo Preventivo</h5>
                        </>
                    ),
                },
            ],
        },
        {
            name: "fiera",
            label: "Fiera",
            required: true,
            grid: { md: 12 },
            type: "selectbox",
            options: [
                { text: "Host Milano 2025", value: "Host Milano 2025" },
                { text: "MIDO Eyewear Show", value: "MIDO Eyewear Show" },
                { text: "EIMA International 2026", value: "EIMA International 2026" },
            ],
            properties: { multiple: false, hideChoseSomething: true },
            hrAfter: true,
        },
        {
            name: "stato",
            label: "Stato",
            required: true,
            grid: { md: 6 },
            type: "selectbox",
            options: [
                { text: "Bozza", value: "Bozza" },
                { text: "Inviato", value: "Inviato" },
                { text: "Accettato", value: "Accettato" },
                { text: "Rifiutato", value: "Rifiutato" },
            ],
            properties: { multiple: false, hideChoseSomething: true },
            extraElements: [
                {
                    position: "before",
                    grid: { md: 12 },
                    element: (
                        <>
                            <MDBIcon fas icon="question-circle" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">Stato e validità</h5>
                        </>
                    ),
                },
            ],
        },
        {
            name: "validitaFino",
            label: "Validità Fino",
            required: true,
            grid: { md: 6 },
            type: "text",
            hrAfter: true,
        },
        {
            name: "descrizione",
            label: "Descrizione dettagliata",
            required: true,
            type: "text_area",
            grid: { md: 12 },
            hrAfter: true,
            extraElements: [
                {
                    position: "before",
                    grid: { md: 12 },
                    element: (
                        <>
                            <MDBIcon fas icon="file-alt" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">Descrizione</h5>
                        </>
                    ),
                },
            ],
        },
        {
            name: "titolo",
            label: "Titolo Preventivo",
            required: true,
            grid: { md: 6 },
            type: "text",
            extraElements: [
                {
                    position: "before",
                    grid: { md: 12 },
                    element: (
                        <>
                            <MDBIcon fas icon="sticky-note" className="me-3" />
                            <h5 className="fs-8 fw-lighter d-inline">Note e Dettagli Aggiuntivi</h5>
                        </>
                    ),
                },
            ],
        },
        { name: "importo", label: "Importo", required: true, grid: { md: 4 }, type: "number" },
        {
            name: "note",
            label: "Note aggiuntive, termini, clausole speciali…",
            required: false,
            type: "text_area",
            grid: { md: 12 },
        },
    ];

    const UpdateEstimate_Fields: FieldConfig<EstimateInfo>[] = [
        { name: "preventivo_uid", label: "UID", type: "text", readOnly: true, grid: { md: 6 } },
        { name: "titolo", label: "Titolo", required: true, type: "text", grid: { md: 6 } },
        {
            name: "stato",
            label: "Stato",
            required: true,
            grid: { md: 6 },
            type: "selectbox",
            options: [
                { text: "Bozza", value: "Bozza" },
                { text: "Inviato", value: "Inviato" },
                { text: "Accettato", value: "Accettato" },
                { text: "Rifiutato", value: "Rifiutato" },
            ],
            properties: { multiple: false, hideChoseSomething: true },
        },
        { name: "validitaFino", label: "Validità Fino", required: true, grid: { md: 6 }, type: "text" },
        { name: "customer_uid", label: "Cliente", required: true, grid: { md: 6 }, type: "text" },
        { name: "tipo", label: "Tipo", required: true, grid: { md: 6 }, type: "text" },
        { name: "fiera", label: "Fiera", required: false, grid: { md: 6 }, type: "text" },
        { name: "importo", label: "Importo", required: true, grid: { md: 4 }, type: "number" },
        { name: "descrizione", label: "Descrizione", required: false, grid: { md: 12 }, type: "text_area" },
        { name: "note", label: "Note", required: false, grid: { md: 12 }, type: "text_area" },
    ];

    // ---------------- Render ----------------
    if (errorPage) return <div className="text-danger">Errore: {errorPage}</div>;
    if (loadingPage) return <General_Loading theme="pageLoading" />;

    return (
        <>
            <MDBContainer className="py-4">
                {/* Header */}
                <MDBRow className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h3 className="fw-bold">Gestione Preventivi</h3>
                            <p className="text-muted mb-0">Gestisci tutti i preventivi del sistema</p>
                        </div>
                        <MDBBtn color="success" onClick={toggleCreateModal}>
                            <MDBIcon fas icon="plus" className="me-2" /> Nuovo Preventivo
                        </MDBBtn>
                    </div>
                </MDBRow>

                {/* Stat Cards */}
                <MDBRow className="g-3 mb-5">
                    <MDBCol md="3">
                        <MDBCard className="border" style={{ backgroundColor: "#f2fdf8" }}>
                            <MDBCardBody className="d-flex align-items-center p-3">
                                <div className="rounded-2 d-flex justify-content-center align-items-center me-3" style={{ backgroundColor: "#d7f5e4", width: 45, height: 45 }}>
                                    <MDBIcon fas icon="file-alt" className="text-success" />
                                </div>
                                <div>
                                    <p className="fw-semibold mb-1 text-success">Preventivi Totali</p>
                                    <h4 className="fw-bold text-success mb-0">{stats.totali}</h4>
                                </div>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                    <MDBCol md="3">
                        <MDBCard className="border" style={{ backgroundColor: "#f3f7ff" }}>
                            <MDBCardBody className="d-flex align-items-center p-3">
                                <div className="rounded-2 d-flex justify-content-center align-items-center me-3" style={{ backgroundColor: "#e2ebff", width: 45, height: 45 }}>
                                    <MDBIcon fas icon="eye" className="text-primary" />
                                </div>
                                <div>
                                    <p className="fw-semibold mb-1 text-primary">Preventivi Inviati</p>
                                    <h4 className="fw-bold text-primary mb-0">{stats.inviati}</h4>
                                </div>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                    <MDBCol md="3">
                        <MDBCard className="border" style={{ backgroundColor: "#f2fdf8" }}>
                            <MDBCardBody className="d-flex align-items-center p-3">
                                <div className="rounded-2 d-flex justify-content-center align-items-center me-3" style={{ backgroundColor: "#d7f5e4", width: 45, height: 45 }}>
                                    <MDBIcon fas icon="check-circle" className="text-success" />
                                </div>
                                <div>
                                    <p className="fw-semibold mb-1 text-success">Preventivi Accettati</p>
                                    <h4 className="fw-bold text-success mb-0">{stats.accettati}</h4>
                                </div>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                    <MDBCol md="3">
                        <MDBCard className="border" style={{ backgroundColor: "#fff9f0" }}>
                            <MDBCardBody className="d-flex align-items-center p-3">
                                <div className="rounded-2 d-flex justify-content-center align-items-center me-3" style={{ backgroundColor: "#ffe8d4", width: 45, height: 45 }}>
                                    <MDBIcon fas icon="dollar-sign" className="text-warning" />
                                </div>
                                <div>
                                    <p className="fw-semibold mb-1 text-warning">Valore Totale</p>
                                    <h4 className="fw-bold text-warning mb-0">{stats.valoreTotale}</h4>
                                </div>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>

                {/* Filtri */}
                <MDBRow className="align-items-center bg-white p-3 rounded-2 border mb-4 g-2">
                    <MDBCol xs="12" md="5" lg="6">
                        <MDBInputGroup className="w-100">
                            <span className="input-group-text bg-white border-end-0">
                                <MDBIcon fas icon="search" />
                            </span>
                            <MDBInput
                                type="text"
                                placeholder="Cerca preventivi per titolo o UID…"
                                className="border-start-0"
                                value={searchDraft}
                                onChange={(e) => setSearchDraft(e.target.value)}
                            />
                        </MDBInputGroup>
                    </MDBCol>

                    <MDBCol xs="6" md="3" lg="2">
                        <MDBDropdown className="w-100">
                            <MDBDropdownToggle color="light" className="w-100 text-start">
                                {filters.stato ? `Stato: ${filters.stato}` : "Tutti gli stati"}
                            </MDBDropdownToggle>
                            <MDBDropdownMenu>
                                <MDBDropdownItem link onClick={() => handleSelectStato("")}>— Tutti —</MDBDropdownItem>
                                <>
                                    {(["Bozza", "Inviato", "Accettato", "Rifiutato"] as StatiPreventivo[]).map((s) => (
                                        <MDBDropdownItem key={s} link onClick={() => handleSelectStato(s)}>
                                            {s}
                                        </MDBDropdownItem>
                                    ))}
                                </>
                            </MDBDropdownMenu>
                        </MDBDropdown>
                    </MDBCol>

                    <MDBCol xs="6" md="3" lg="2">
                        <MDBDropdown className="w-100">
                            <MDBDropdownToggle color="light" className="w-100 text-start">
                                {filters.tipo ? `Tipo: ${filters.tipo}` : "Tutti i tipi"}
                            </MDBDropdownToggle>
                            <MDBDropdownMenu>
                                <MDBDropdownItem link onClick={() => handleSelectTipo("")}>— Tutti —</MDBDropdownItem>
                                <>
                                    {predefinedObjectives.map((o) => (
                                        <MDBDropdownItem key={o.preventivo_uid} link onClick={() => handleSelectTipo(o.title)}>
                                            {o.title}
                                        </MDBDropdownItem>
                                    ))}
                                </>
                            </MDBDropdownMenu>
                        </MDBDropdown>
                    </MDBCol>

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

                {/* Tabella */}
                <MDBRow className="mb-4">
                    <MDBCard className="border rounded-3 mb-3">
                        <MDBTable align="middle" hover responsive className="mb-4">
                            <MDBTableHead light>
                                <tr className="fw-semibold text-muted" style={{ fontSize: "0.9rem" }}>
                                    <th>
                                        <MDBIcon fas icon="file-alt" className="me-2 text-success" />
                                        Preventivo
                                    </th>
                                    <th>
                                        <MDBIcon fas icon="user" className="me-2 text-success" />
                                        Cliente
                                    </th>
                                    <th>
                                        <MDBIcon fas icon="layer-group" className="me-2 text-success" />
                                        Tipo
                                    </th>
                                    <th>
                                        <MDBIcon fas icon="toggle-on" className="me-2 text-success" />
                                        Stato
                                    </th>
                                    <th>
                                        <MDBIcon fas icon="dollar-sign" className="me-2 text-success" />
                                        Importo
                                    </th>
                                    <th>
                                        <MDBIcon fas icon="calendar" className="me-2 text-success" />
                                        Validità
                                    </th>
                                    <th>
                                        <MDBIcon fas icon="cogs" className="me-2 text-success" />
                                        Azioni
                                    </th>
                                </tr>
                            </MDBTableHead>

                            <MDBTableBody>
                                {loadingList && (
                                    <tr>
                                        <td colSpan={7} className="py-4">
                                            <div className="d-flex align-items-center justify-content-center gap-3">
                                                <General_Loading theme="formLoading" text="Caricamento Preventivi" />
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loadingList && errorList && (
                                    <tr>
                                        <td colSpan={7} className="py-4">
                                            <div className="d-flex flex-column align-items-center justify-content-center gap-2">
                                                <div className="text-danger">
                                                    <MDBIcon fas icon="exclamation-triangle" className="me-2" />
                                                    {errorList}
                                                </div>
                                                <MDBBtn color="danger" size="sm" onClick={fetchEstimatesOnDemand}>
                                                    <MDBIcon fas icon="redo" className="me-2" />
                                                    Riprova
                                                </MDBBtn>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loadingList && !errorList && estimates.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-4">
                                            <div className="text-center text-muted">
                                                <MDBIcon far icon="folder-open" className="me-2" /> Nessun preventivo trovato con i filtri correnti.
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loadingList && !errorList && estimates.length > 0 && (
                                    <>
                                        {estimates.map((p, i) => (
                                            <tr key={p.preventivo_uid || i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fcfcfc", borderBottom: "1px solid #f0f0f0" }}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-2 d-flex justify-content-center align-items-center text-success me-3" style={{ width: 40, height: 40, backgroundColor: "#d7f5e4" }}>
                                                            <MDBIcon fas icon="file-alt" />
                                                        </div>
                                                        <div className="d-flex flex-column align-items-start">
                                                            <strong>{p.titolo}</strong>
                                                            <div className="text-muted small">{p.preventivo_uid}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-dark">{p.customer_uid}</td>
                                                <td>{p.tipo}</td>
                                                <td>
                                                    <MDBBadge color="light" pill className="border text-dark px-2 py-1">
                                                        {p.stato}
                                                    </MDBBadge>
                                                </td>
                                                <td className="fw-bold text-dark">{moneyFmt(p.importo)}</td>
                                                <td className="text-muted small">Fino al: {p.validitaFino}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <MDBBtn size="sm" color="link" className="text-muted p-0" title="Modifica" onClick={() => navigate(`/project/economic_offert/edit/${encodeURIComponent(p.preventivo_uid || "")}`)}>
                                                            <MDBIcon fas icon="pen" />
                                                        </MDBBtn>
                                                        <MDBBtn size="sm" color="link" className="text-muted p-0" title="Elimina">
                                                            <MDBIcon fas icon="trash" />
                                                        </MDBBtn>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </MDBTableBody>
                        </MDBTable>

                        {/* Footer tabella: per-pagina & paginazione */}
                        <div className="d-flex justify-content-between align-items-center p-3">
                            <div className="w-10">
                                <MDBBtnGroup>
                                    <MDBDropdown>
                                        <MDBDropdownToggle color="secondary" className="shadow-0" animation={false}>
                                            Per pagina {filters.per_page}
                                        </MDBDropdownToggle>
                                        <MDBDropdownMenu>
                                            {[10, 25, 50, 100].map((n) => (
                                                <MDBDropdownItem key={n} onClick={() => setRowsForPage(n)} link>
                                                    {n}
                                                </MDBDropdownItem>
                                            ))}
                                        </MDBDropdownMenu>
                                    </MDBDropdown>
                                </MDBBtnGroup>
                            </div>

                            <Pagination setCurrentPage={setCurrentPage} currentPage={filters.page ?? 1} totalPages={10 /* TODO: usa meta.pages_num dal backend se presente */} />
                        </div>
                    </MDBCard>
                </MDBRow>
            </MDBContainer>

            {/* Modal Create */}
            <MDBModal tabIndex="-1" open={createModalOpen} setOpen={setCreateModalOpen}>
                <MDBModalDialog centered size="lg">
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>Nuovo Preventivo</MDBModalTitle>
                            <MDBBtn className="btn-close" color="none" onClick={toggleCreateModal}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody className="mx-3">
                            <GeneralForm<EstimateInfo, { project_uid: string }>
                                params={{ project_uid }}
                                mode="create"
                                fields={CreateEstimate_Fields}
                                createData={async (data) => {
                                    // Adatta: se hai già l'API reale, sostituisci questa chiamata
                                    const resp = await create_estimate(data as any);
                                    return resp;
                                }}
                                createBtnProps={{ label: "Salva Nuovo Preventivo", labelSaving: "Salvataggio in corso" }}
                                onSuccess={(_created) => {
                                    toggleCreateModal();
                                    setFilters((prev) => ({ ...prev })); // trigger refetch
                                }}
                            />
                        </MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    );
};

export default EstimatesList;
