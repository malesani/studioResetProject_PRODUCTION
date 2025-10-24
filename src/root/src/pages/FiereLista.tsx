import React, { useEffect, useMemo, useRef, useState } from "react";
import General_Loading from "../app_components/General_Loading";
import { GeneralForm, FieldConfig } from "../app_components/GeneralForm";
import { TableFilters } from "../app_components/TableData/interfaces";

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
    MDBModalTitle,
    MDBBtnGroup,
} from "mdb-react-ui-kit";

import Pagination from "../app_components/TableData/components/Pagination";
import { APIFair, get_fairsListPaginated, create_fair } from "../api_module/fairs/FairsRequest";

type ViewMode = "griglia" | "cards";

export interface ObjectivesListProps {
    project_uid: string;
}

const FiereLista: React.FC<ObjectivesListProps> = ({ project_uid }) => {
    // ===== Modali =====
    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const toggleCreateModal = () => setCreateModalOpen((o) => !o);

    // ===== Vista =====
    const [viewMode, setViewMode] = useState<ViewMode>("griglia");

    // ===== Stato globale pagina =====
    const [loadingMode, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ===== Dati lista =====
    const [total_fairs, setTotalFairs] = useState<number>(0);
    const [fairs_list, setFairsList] = useState<APIFair[]>([]);

    // ===== Filtri & paginazione (come prodotti) =====
    const [fairsFilters, setFairsFilters] = useState<TableFilters<APIFair>>({
        page: 1,
        per_page: 50,
        search: "",
        sector: "",   // <— string per TableFilters
        active: "",   // <— string vuota/"1"/"0" per TableFilters
    });

    const mapActiveToParam = (val: string): 0 | 1 | undefined =>
        val === "" ? undefined : (val === "1" ? 1 : 0);

    const mapSectorToParam = (val?: string): string | undefined =>
        val && val.trim() !== "" ? val : undefined;

    const [loadingMode_fairs, setLoading_fairs] = useState<boolean>(false);
    const [error_fairs, setError_fairs] = useState<string | null>(null);

    // search con debounce → aggiorna filters.search e reset page
    const [searchDraft, setSearchDraft] = useState<string>(fairsFilters.search ?? "");
    useEffect(() => {
        const t = setTimeout(() => {
            setFairsFilters((prev) => ({
                ...prev,
                page: 1,
                search: searchDraft,
            }));
        }, 400);
        return () => clearTimeout(t);
    }, [searchDraft]);

    // Handlers filtri UI
    const handleSelectSector = (value: string) => {
        setFairsFilters(prev => ({ ...prev, page: 1, sector: value }));
    };

    const handleSelectActive = (value: "" | "1" | "0") => {
        setFairsFilters(prev => ({ ...prev, page: 1, active: value }));
    };

    const setCurrentPage = (page: number) => {
        setFairsFilters((prev) => ({ ...prev, page }));
    };

    const setRowsForPage = (per_page: number) => {
        setFairsFilters((prev) => ({
            ...prev,
            per_page,
            page: 1,
        }));
    };

    // Options settore dinamiche (dalla pagina corrente)
    const sectorOptions = useMemo(
        () => Array.from(
            new Set(
                (fairs_list ?? [])
                    .map(f => (f.sector ?? "").trim())
                    .filter(Boolean)
            )
        ),
        [fairs_list]
    );


    // ===== Fetch on-demand =====
    const fetchFairsOnDemand = async () => {
        setLoading_fairs(true);
        setError_fairs(null);
        try {
            const args: Parameters<typeof get_fairsListPaginated>[0] = {
                search: fairsFilters.search ?? "",
                page: fairsFilters.page ?? 1,
                per_page: fairsFilters.per_page ?? 50,
                sector: mapSectorToParam(String(fairsFilters.sector || "")),
                active: mapActiveToParam(String(fairsFilters.active || "")),
            };

            const response = await get_fairsListPaginated(args);
            if (response.success && response.data) {
                setTotalFairs(response.data.meta?.items_num ?? 0);
                setFairsList(response.data.rows);
            } else {
                setError_fairs(response.message || "Errore nel recupero fiere");
            }
        } catch (err: any) {
            setError_fairs(err.message || "Errore di rete");
        } finally {
            setLoading_fairs(false);
        }
    };


    // ===== First load (splash) =====
    useEffect(() => {
        let isMounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const args: Parameters<typeof get_fairsListPaginated>[0] = {
                    search: fairsFilters.search ?? "",
                    page: fairsFilters.page ?? 1,
                    per_page: fairsFilters.per_page ?? 50,
                    sector: mapSectorToParam(String(fairsFilters.sector || "")),
                    active: mapActiveToParam(String(fairsFilters.active || "")),
                };
                const listRes = await get_fairsListPaginated(args);

                if (!isMounted) return;

                if (listRes.success && listRes.data) {
                    setTotalFairs(listRes.data.meta?.items_num ?? 0);
                    setFairsList(listRes.data.rows);
                } else {
                    throw new Error(listRes.message || "Errore nel recupero fiere");
                }
            } catch (err: any) {
                if (isMounted) setError(err?.message || "Errore di rete");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    // ===== Refetch quando cambiano i filtri (dopo il primo load) =====
    const didInitRef = useRef(false);
    useEffect(() => {
        if (!didInitRef.current) {
            didInitRef.current = true;
            return;
        }
        fetchFairsOnDemand();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fairsFilters.search, fairsFilters.page, fairsFilters.per_page, fairsFilters.sector, fairsFilters.active]);

    // ====== FORM CREATE (facoltativo) ======
    type FieraForm = Pick<APIFair, "name" | "start_date" | "end_date"> &
        Partial<Omit<APIFair, "fair_uid" | "company_uid" | "created_at" | "updated_at" | "duration_days">>;

    const CreateFair_FormFields: FieldConfig<FieraForm>[] = [
        {
            name: "name",
            label: "Nome Fiera",
            required: true,
            type: "text",
            grid: { md: 12 },
            extraElements: [
                {
                    position: "before",
                    grid: { md: 12 },
                    element: (
                        <>
                            <MDBIcon fas icon="campground" className="me-2" />
                            <h5 className="fs-6 fw-semibold d-inline">Nome Fiera</h5>
                        </>
                    ),
                },
            ],
        },
        {
            name: "start_date",
            label: "Data di inizio",
            required: true,
            type: "date",
            grid: { md: 6 },
            properties: { format: 'yyyy-mm-dd' },
            extraElements: [
                {
                    position: "before",
                    grid: { md: 12 },
                    element: (
                        <>
                            <MDBIcon fas icon="calendar" className="me-2" />
                            <h5 className="fs-6 fw-semibold d-inline">Periodo Fiera</h5>
                        </>
                    ),
                },
            ],
        },
        {
            name: "end_date", label: "Data di fine",
            required: true, type: "date", properties: { format: 'yyyy-mm-dd' }, grid: { md: 6 }
        },
        {
            name: "location",
            label: "Località",
            type: "text",
            grid: { md: 4 },
            extraElements: [
                {
                    position: "before",
                    grid: { md: 12 },
                    element: (
                        <>
                            <MDBIcon fas icon="people-carry" className="me-2" />
                            <h5 className="fs-6 fw-semibold d-inline">Info Operative</h5>
                        </>
                    ),
                },
            ],
        },
        { name: "sector", label: "Settore", type: "text", grid: { md: 4 } },
        {
            name: "active",
            label: "Stato",
            type: "selectbox",
            grid: { md: 4 },
            options: [
                { text: "Attiva/Programm.", value: 1, defaultSelected: true },
                { text: "Disattivata", value: 0 },
            ],
        },
        {
            name: "website",
            label: "Sito Web",
            type: "text",
            grid: { md: 12 },
            extraElements: [
                {
                    position: "before",
                    grid: { md: 12 },
                    element: (
                        <>
                            <MDBIcon fas icon="plus-square" className="me-2" />
                            <h5 className="fs-6 fw-semibold d-inline">Info Aggiuntive</h5>
                        </>
                    ),
                },
            ],
        },
        { name: "description", label: "Descrizione", type: "text_area", grid: { md: 12 } },
        { name: "note", label: "Note", type: "text_area", grid: { md: 12 } },
    ];

    async function onCreateFair(
        fd: Pick<APIFair, "name" | "start_date" | "end_date"> &
            Partial<Omit<APIFair, "fair_uid" | "company_uid" | "created_at" | "updated_at" | "duration_days">>
    ) {
        const rawActive = (fd as any).active;
        const to01 = (v: unknown): 0 | 1 => (v === "1" || v === 1 || v === true ? 1 : 0);
        const normalizedActive: 0 | 1 | undefined = rawActive === undefined ? 1 : to01(rawActive);

        const res = await create_fair({ ...fd, active: normalizedActive });

        if (res.response.success) {
            // 🔄 refresh immediato della lista con i filtri correnti
            await fetchFairsOnDemand();
        }
        return res;
    }



    // ====== RENDER ======
    // Splash error
    if (error) return <div className="text-danger">Errore: {error}</div>;
    // Splash loading
    if (loadingMode) return <General_Loading theme="pageLoading" />;

    return (
        <>
            <MDBContainer className="py-4">
                {/* Header */}
                <MDBRow className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h3 className="fw-bold">Gestione Fiere</h3>
                            <p className="text-muted mb-0">Gestisci tutte le fiere ed eventi</p>
                        </div>
                        <MDBBtn onClick={toggleCreateModal} color="success">
                            <MDBIcon fas icon="plus" className="me-2" /> Nuova Fiera
                        </MDBBtn>
                    </div>
                </MDBRow>

                {/* FILTRI + Azioni */}
                <MDBRow className="align-items-center bg-white p-3 rounded-2 border mb-4 g-2">
                    {/* Ricerca */}
                    <MDBCol xs="12" md="6" lg="4">
                        <MDBInputGroup className="w-100">
                            <span className="input-group-text bg-white border-end-0">
                                <MDBIcon fas icon="search" />
                            </span>
                            <MDBInput
                                type="text"
                                placeholder="Cerca fiere per nome o località"
                                className="border-start-0"
                                value={searchDraft}
                                onChange={(e) => setSearchDraft(e.target.value)}
                            />
                        </MDBInputGroup>
                    </MDBCol>

                    {/* Settore */}
                    <MDBCol xs="6" md="3" lg="2">
                        <MDBDropdown className="w-100">
                            <MDBDropdownToggle color="light" className="w-100 text-start">
                                {fairsFilters.sector ? `Settore: ${fairsFilters.sector}` : "Tutti i settori"}
                            </MDBDropdownToggle>
                            <MDBDropdownMenu>
                                <MDBDropdownItem link onClick={() => handleSelectSector("")}>
                                    Tutti i settori
                                </MDBDropdownItem>
                                <>
                                    {sectorOptions.map((s) => (
                                        <MDBDropdownItem key={s} link onClick={() => handleSelectSector(s)}>
                                            {s}
                                        </MDBDropdownItem>
                                    ))}
                                </>
                            </MDBDropdownMenu>
                        </MDBDropdown>
                    </MDBCol>

                    {/* Stato */}
                    <MDBCol xs="6" md="3" lg="2">
                        <MDBDropdown className="w-100">
                            <MDBDropdownToggle color="light" className="w-100 text-start">
                                {fairsFilters.active === ""
                                    ? "Tutti gli stati"
                                    : fairsFilters.active === "1"
                                        ? "Solo Attive"
                                        : "Solo Disattive"}
                            </MDBDropdownToggle>
                            <MDBDropdownMenu>
                                <MDBDropdownItem link onClick={() => handleSelectActive("")}>
                                    Tutti gli stati
                                </MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => handleSelectActive("1")}>
                                    Attive/Programmate
                                </MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => handleSelectActive("0")}>
                                    Disattivate/Annullate
                                </MDBDropdownItem>
                            </MDBDropdownMenu>
                        </MDBDropdown>
                    </MDBCol>

                    {/* Toggle vista */}
                    <MDBCol xs="12" md="6" lg="4" className="d-flex justify-content-end">
                        <div className="d-flex align-items-center gap-2">
                            <MDBBtn
                                color="light"
                                className="px-3"
                                title={viewMode === "griglia" ? "Vista cards" : "Vista griglia"}
                                onClick={() => setViewMode(viewMode === "griglia" ? "cards" : "griglia")}
                            >
                                <MDBIcon fas icon={viewMode === "griglia" ? "list" : "th-large"} />
                            </MDBBtn>
                        </div>
                    </MDBCol>
                </MDBRow>

                {/* ====== LISTA (TABELLARE) ====== */}
                {viewMode === "griglia" && (
                    <MDBCard className="border rounded-3 mb-3">
                        {/* Loading / Error / Empty (tabella) */}
                        {loadingMode_fairs && (
                            <div className="py-4">
                                <div className="d-flex align-items-center justify-content-center gap-3">
                                    <General_Loading theme="formLoading" text="Caricamento Fiere" />
                                </div>
                            </div>
                        )}

                        {!loadingMode_fairs && error_fairs && (
                            <div className="py-4 text-center">
                                <div className="text-danger mb-3">
                                    <MDBIcon fas icon="exclamation-triangle" className="me-2" />
                                    {error_fairs}
                                </div>
                                <MDBBtn color="danger" size="sm" onClick={fetchFairsOnDemand}>
                                    <MDBIcon fas icon="redo" className="me-2" />
                                    Riprova
                                </MDBBtn>
                            </div>
                        )}

                        {!loadingMode_fairs && !error_fairs && fairs_list.length === 0 && (
                            <div className="py-4 text-center text-muted">
                                <MDBIcon far icon="folder-open" className="me-2" />
                                Nessuna fiera trovata con i filtri correnti.
                            </div>
                        )}

                        {!loadingMode_fairs && !error_fairs && fairs_list.length > 0 && (
                            <>
                                <div
                                    className="d-grid fw-semibold text-muted px-3 py-3 bg-light"
                                    style={{
                                        gridTemplateColumns: "2fr 1fr 0.7fr 2fr 2fr 1.2fr",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    <div>NOME</div>
                                    <div>
                                        <MDBIcon fas icon="calendar-day" className="me-2" />
                                        DAL
                                    </div>
                                    <div>
                                        <MDBIcon fas icon="calendar-check" className="me-2" />
                                        AL
                                    </div>
                                    <div>
                                        <MDBIcon fas icon="map-marker-alt" className="me-2" />
                                        LOCALITÀ
                                    </div>
                                    <div>
                                        <MDBIcon fas icon="tags" className="me-2" />
                                        SETTORE
                                    </div>
                                    <div>
                                        <MDBIcon fas icon="toggle-on" className="me-2" />
                                        STATO
                                    </div>
                                </div>

                                {fairs_list.map((fiera, i) => (
                                    <MDBCardBody
                                        key={fiera.fair_uid ?? i}
                                        className="d-grid align-items-center px-3 py-3"
                                        style={{
                                            gridTemplateColumns: "2fr 1fr 0.7fr 2fr 2fr 1.2fr",
                                            borderBottom: "1px solid #f0f0f0",
                                            backgroundColor: i % 2 === 0 ? "#fff" : "#fafbfc",
                                        }}
                                    >
                                        <div className="fw-bold text-dark">{fiera.name}</div>
                                        <div>{fiera.start_date}</div>
                                        <div>{fiera.end_date}</div>
                                        <div>
                                            <MDBIcon fas icon="map-marker-alt" className="me-2 text-secondary" />
                                            {fiera.location}
                                        </div>
                                        <div>{fiera.sector || "—"}</div>
                                        <div>
                                            <MDBBadge
                                                color={fiera.active ? "success" : "secondary"}
                                                className="px-2 py-2 fw-semibold text-white"
                                            >
                                                {fiera.active ? "Attiva" : "Disattivata"}
                                            </MDBBadge>
                                        </div>
                                    </MDBCardBody>
                                ))}

                                {/* Footer paginazione */}
                                <div className="d-flex justify-content-between align-items-center p-3">
                                    <div className="w-10">
                                        <MDBBtnGroup>
                                            <MDBDropdown>
                                                <MDBDropdownToggle color="secondary" className="shadow-0">
                                                    Per pagina {fairsFilters.per_page}
                                                </MDBDropdownToggle>
                                                <MDBDropdownMenu>
                                                    <MDBDropdownItem onClick={() => setRowsForPage(10)} link>
                                                        10
                                                    </MDBDropdownItem>
                                                    <MDBDropdownItem onClick={() => setRowsForPage(25)} link>
                                                        25
                                                    </MDBDropdownItem>
                                                    <MDBDropdownItem onClick={() => setRowsForPage(50)} link>
                                                        50
                                                    </MDBDropdownItem>
                                                    <MDBDropdownItem onClick={() => setRowsForPage(100)} link>
                                                        100
                                                    </MDBDropdownItem>
                                                </MDBDropdownMenu>
                                            </MDBDropdown>
                                        </MDBBtnGroup>
                                    </div>

                                    <Pagination
                                        setCurrentPage={setCurrentPage}
                                        currentPage={fairsFilters.page ?? 1}
                                        // Se il backend restituisce pages_num, usalo qui:
                                        totalPages={Math.max(1, Math.ceil((total_fairs || 0) / (fairsFilters.per_page || 50)))}
                                    />
                                </div>
                            </>
                        )}
                    </MDBCard>
                )}

                {/* ====== LISTA (CARDS) ====== */}
                {viewMode === "cards" && (
                    <>
                        {loadingMode_fairs && (
                            <MDBCard className="border rounded-2 bg-white p-4 text-center text-muted">
                                <MDBIcon fas icon="spinner" spin className="me-2" />
                                Caricamento fiere…
                            </MDBCard>
                        )}

                        {!loadingMode_fairs && error_fairs && (
                            <MDBCard className="border rounded-2 bg-white p-4 text-center text-danger">
                                <MDBIcon fas icon="exclamation-triangle" className="me-2" />
                                {error_fairs}
                                <div className="mt-3">
                                    <MDBBtn size="sm" color="danger" onClick={fetchFairsOnDemand}>
                                        <MDBIcon fas icon="redo" className="me-2" />
                                        Riprova
                                    </MDBBtn>
                                </div>
                            </MDBCard>
                        )}

                        {!loadingMode_fairs && !error_fairs && fairs_list.length === 0 && (
                            <MDBCard className="border rounded-2 bg-white p-4 text-center text-muted">
                                <MDBIcon far icon="folder-open" className="me-2" />
                                Nessuna fiera trovata con i filtri correnti.
                            </MDBCard>
                        )}

                        {!loadingMode_fairs && !error_fairs && fairs_list.length > 0 && (
                            <MDBRow className="g-3">
                                {fairs_list.map((fiera, i) => (
                                    <MDBCol key={fiera.fair_uid ?? i} md="6" lg="4">
                                        <MDBCard className="h-100 shadow-sm">
                                            <MDBCardBody>
                                                <h5 className="fw-bold mb-2">{fiera.name}</h5>
                                                <p className="text-muted mb-1">
                                                    <MDBIcon fas icon="calendar" className="me-2" />
                                                    {fiera.start_date} → {fiera.end_date}
                                                </p>
                                                <p className="mb-1">
                                                    <MDBIcon fas icon="map-marker-alt" className="me-2 text-secondary" />
                                                    {fiera.location}
                                                </p>
                                                <p className="mb-1">
                                                    <MDBIcon fas icon="tags" className="me-2 text-secondary" />
                                                    {fiera.sector || "—"}
                                                </p>
                                                <MDBBadge color={fiera.active ? "success" : "secondary"} className="mt-2 text-white">
                                                    {fiera.active ? "Attiva" : "Disattivata"}
                                                </MDBBadge>

                                            </MDBCardBody>
                                        </MDBCard>
                                    </MDBCol>
                                ))}
                            </MDBRow>
                        )}

                        {/* Paginazione anche per cards */}
                        {!loadingMode_fairs && !error_fairs && fairs_list.length > 0 && (
                            <div className="d-flex justify-content-end align-items-center p-3">
                                <Pagination
                                    setCurrentPage={setCurrentPage}
                                    currentPage={fairsFilters.page ?? 1}
                                    totalPages={Math.max(1, Math.ceil((total_fairs || 0) / (fairsFilters.per_page || 50)))}
                                />
                            </div>
                        )}
                    </>
                )}
            </MDBContainer>

            {/* MODALE CREATE */}
            <MDBModal tabIndex="-1" open={createModalOpen} setOpen={setCreateModalOpen}>
                <MDBModalDialog centered size="lg">
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>Nuova Fiera</MDBModalTitle>
                            <MDBBtn className="btn-close" color="none" onClick={toggleCreateModal}></MDBBtn>
                        </MDBModalHeader>

                        <MDBModalBody>
                            <GeneralForm<
                                Pick<APIFair, "name" | "start_date" | "end_date"> &
                                Partial<Omit<APIFair, "fair_uid" | "company_uid" | "created_at" | "updated_at" | "duration_days">>,
                                { project_uid: string }
                            >
                                params={{ project_uid }}
                                mode="create"
                                fields={CreateFair_FormFields}
                                createData={onCreateFair}
                                onSuccess={() => {
                                    toggleCreateModal();
                                }}
                                createBtnProps={{ label: "Salva Nuova Fiera", labelSaving: "Salvataggio..." }}
                            />
                        </MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    );
};

export default FiereLista;
