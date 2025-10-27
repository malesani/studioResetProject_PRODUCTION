// src/pages/FornitoriLista.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MDBContainer, MDBCard, MDBRow, MDBCol, MDBInputGroup, MDBIcon, MDBInput,
  MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBBtn,
  MDBBadge, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog,
  MDBModalHeader, MDBModalTitle
} from "mdb-react-ui-kit";

import Pagination from "../app_components/TableData/components/Pagination";
import { GeneralForm, FieldConfig } from "../app_components/GeneralForm";
import { useFormAlert } from "../app_components/GeneralAlert";
import Swal from 'sweetalert2'
import type { SweetAlertOptions } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
import General_Loading from "../app_components/General_Loading"; import { TableFilters } from "../app_components/TableData/interfaces";

import {
  APISupplier,
  get_suppliersListPaginated,
  create_supplier,
  update_supplier,
  delete_supplierByUid
} from "../api_module/suppliers/SuppliersRequest";

// ⬇️ import UI e request per IMPORT (riuso stessi component/tipi dei prodotti)
import { Import_FormFields, ImportForm, upload_import_suppliers, run_import_suppliers, UploadResp, RunResp } from '../app_components/imports/ImportsRequest';
import DryRunReport from "../app_components/imports/DryRunReport";

/* ====== FORM FIELDS ====== */
const Supplier_FormFields: FieldConfig<APISupplier>[] = [
  {
    name: "company_name",
    label: "Ragione Sociale",
    required: true,
    type: "text",
    grid: { md: 12 },
    extraElements: [{
      position: "before",
      grid: { md: 12 },
      element: (
        <div className="d-flex align-items-center mb-1">
          <MDBIcon fas icon="building" className="me-2" />
          <h5 className="fs-6 fw-semibold mb-0">Dati aziendali</h5>
        </div>
      )
    }]
  },

  { name: "cf", label: "Codice Fiscale", type: "text", grid: { md: 6 } },
  { name: "piva", label: "Partita IVA", type: "text", grid: { md: 6 } },

  { name: "indirizzo", label: "Indirizzo", type: "text", grid: { md: 12 } },
  { name: "city", label: "Città", type: "text", grid: { md: 4 } },   // API: city ←→ DB: citta
  { name: "cap", label: "CAP", type: "text", grid: { md: 4 } },
  { name: "province", label: "Provincia", type: "text", grid: { md: 4 } },
  { name: "region", label: "Regione", type: "text", grid: { md: 6 } },
  { name: "state", label: "Stato (Paese)", type: "text", grid: { md: 6 } },

  {
    name: "ref_name", label: "Referente", type: "text", grid: { md: 6 },
    extraElements: [{
      position: "before",
      grid: { md: 12 },
      element: (
        <div className="d-flex align-items-center mb-1">
          <MDBIcon fas icon="address-card" className="me-2" />
          <h5 className="fs-6 fw-semibold mb-0">Contatti</h5>
        </div>
      )
    }]
  },
  { name: "ref_phone", label: "Telefono", type: "text", grid: { md: 6 } },
  { name: "ref_fax", label: "Fax", type: "text", grid: { md: 6 } },
  { name: "ref_email", label: "Email", type: "text", grid: { md: 6 } },
  { name: "ref_pec", label: "PEC", type: "text", grid: { md: 6 } },

  { name: "note", label: "Note", type: "text_area", grid: { md: 12 } },
];

export interface ObjectivesListProps {
  project_uid: string;
}

const FornitoriLista: React.FC<ObjectivesListProps> = ({ project_uid }) => {
  const Swal2 = withReactContent(Swal)
  const { showAlertLoading, showAlertSuccess, showAlertError, FormAlert } = useFormAlert();

  // dati lista
  const [suppliers, setSuppliers] = useState<APISupplier[]>([]);
  const [total, setTotal] = useState<number>(0);

  // filtri + paginazione
  const [filters, setFilters] = useState<TableFilters<APISupplier> & { region?: string; state?: string; }>({
    page: 1,
    per_page: 25,
    search: "",
    region: "",
    state: "",
  });

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modali CRUD
  const [createOpen, setCreateOpen] = useState(false);
  const toggleCreate = () => setCreateOpen(o => !o);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<APISupplier | null>(null);
  const toggleEdit = () => { setEditOpen(o => !o); if (editOpen) setSelected(null); };

  // HANDLERS
  const handleDelete = async (supplier_uid: string) => {
    const defaultOpts: SweetAlertOptions = {
      title: "Sei sicuro di voler eliminare questo fornitore?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Elimina",
      confirmButtonColor: "#DC4C64",
      cancelButtonText: "Annulla",
      cancelButtonColor: "#9FA6B2"
    };
    const result = await Swal2.fire(defaultOpts);

    if (!result.isConfirmed) { return; }

    try {
      showAlertLoading("Eliminazione in corso ...");
      const result = await delete_supplierByUid!({ supplier_uid: supplier_uid! });    // invoca la tua API con payload = params + dati univoci dal row.data

      if (result.response.success) {
        setSuppliers(rs => rs.filter(r => r.supplier_uid !== supplier_uid));         // rimuovi localmente
        showAlertSuccess(result.response.message || "Eliminato con successo");
      } else {
        showAlertError(result.response.message || 'Errore durante il salvataggio.');
      }
    } catch (err: any) {
      showAlertError(err.message || "Errore in eliminazione");
    } finally {
      setLoading(false);
    }
  };
  // END

  // 🔽 MODALE IMPORT (uguale ai prodotti)
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importUpload, setImportUpload] = useState<UploadResp | null>(null); // job_id + headers + mapping + preview
  const [dryRun, setDryRun] = useState<RunResp | null>(null);
  const [commitLoading, setCommitLoading] = useState(false);

  const toggleImportModal = () => {
    setImportModalOpen((o) => !o);
    if (!importModalOpen) {
      setImportUpload(null);
      setDryRun(null);
      setCommitLoading(false);
    }
  };

  // search debounce
  const [searchDraft, setSearchDraft] = useState<string>(filters.search ?? "");
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1, search: searchDraft }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchDraft]);

  /* =========================
   * HELPERS DI FETCH
   * ========================= */

  // 1) helper iniziale (splash)
  const fetchSuppliersInitial = async () => {
    setLoading(true);
    setError(null);
    try {
      const args = {
        search: filters.search ?? "",
        page: filters.page ?? 1,
        per_page: filters.per_page ?? 25,
        region: filters.region?.trim() ? filters.region : undefined,
        state: filters.state?.trim() ? filters.state : undefined,
      };
      const res = await get_suppliersListPaginated(args);
      if (res.success && res.data) {
        setSuppliers(res.data.rows);
        setTotal(res.data.meta?.items_num ?? 0);
      } else {
        throw new Error(res.message || "Errore nel recupero fornitori");
      }
    } catch (e: any) {
      setError(e?.message || "Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  // 2) helper on-demand (retry, post-create, post-update, post-import)
  const fetchSuppliersOnDemand = async () => {
    setLoading(true);
    setError(null);
    try {
      const args = {
        search: filters.search ?? "",
        page: filters.page ?? 1,
        per_page: filters.per_page ?? 25,
        region: filters.region?.trim() ? filters.region : undefined,
        state: filters.state?.trim() ? filters.state : undefined,
      };
      const res = await get_suppliersListPaginated(args);
      if (res.success && res.data) {
        setSuppliers(res.data.rows);
        setTotal(res.data.meta?.items_num ?? 0);
      } else {
        setError(res.message || "Errore nel recupero fornitori");
      }
    } catch (e: any) {
      setError(e?.message || "Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  // primo caricamento
  useEffect(() => {
    fetchSuppliersInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch quando cambiano i filtri (dopo il primo render)
  const didInit = useRef(false);
  useEffect(() => {
    if (!didInit.current) { didInit.current = true; return; }
    fetchSuppliersOnDemand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.page, filters.per_page, filters.region, filters.state]);

  // derive filtri rapidi (region/state) dalle righe in pagina
  const regionOptions = useMemo(
    () => Array.from(new Set(suppliers.map(s => s.region).filter(Boolean))) as string[],
    [suppliers]
  );
  const stateOptions = useMemo(
    () => Array.from(new Set(suppliers.map(s => s.state).filter(Boolean))) as string[],
    [suppliers]
  );

  /* ============== IMPORT HANDLERS (come prodotti) ============== */

  // STEP 1: upload + dry-run
  async function onImportSubmit(fd: ImportForm) {
    const up = await upload_import_suppliers({
      ...fd,
      dry_run: true, // (non è usato in upload ma teniamo stesso shape)
    });

    if (!up.response.success || !up.data) {
      return false;
    }

    setImportUpload(up.data);

    const rr = await run_import_suppliers({
      job_id: up.data.job_id,
      mapping: up.data.mapping, // se aggiungi UI mapping, passa quello aggiornato
      dry_run: true,
    });

    if (!rr.response.success || !rr.data) {
      return false;
    }

    setDryRun(rr.data);
    return true;
  }

  // STEP 2: commit
  async function onConfirmCommit() {
    if (!importUpload) return;
    setCommitLoading(true);

    const run = await run_import_suppliers({
      job_id: importUpload.job_id,
      mapping: importUpload.mapping,
      dry_run: false,
    });

    setCommitLoading(false);

    if (run.response.success) {
      setImportModalOpen(false);
      setImportUpload(null);
      setDryRun(null);
      fetchSuppliersOnDemand(); // refresh on-demand della tabella
    } else {
      // opzionale: mostrare toast/alert
    }
  }

  return (
    <MDBContainer className="py-4">
      {/* Header */}
      <MDBRow className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold">Gestione Fornitori</h3>
            <p className="text-muted mb-0">Gestisci tutti i fornitori del sistema</p>
          </div>
          <div className="d-flex gap-2">
            <MDBBtn color="light" onClick={toggleImportModal} title="Importa Fornitori">
              <MDBIcon fas icon="upload" className="me-2" />
              Importa
            </MDBBtn>
            <MDBBtn onClick={toggleCreate} color="success">
              <MDBIcon fas icon="plus" className="me-2" /> Nuovo Fornitore
            </MDBBtn>
          </div>
        </div>
      </MDBRow>

      {/* Filtri */}
      <MDBRow className="align-items-center bg-white p-3 rounded-2 border mb-4 g-2">
        <MDBCol xs="12" md="6" lg="6">
          <MDBInputGroup className="w-100">
            <span className="input-group-text bg-white border-end-0">
              <MDBIcon fas icon="search" />
            </span>
            <MDBInput
              type="text"
              placeholder="Cerca per ragione sociale, contatti, città…"
              className="border-start-0"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </MDBInputGroup>
        </MDBCol>

        {/* Region */}
        <MDBCol xs="6" md="3" lg="3">
          <MDBDropdown className="w-100">
            <MDBDropdownToggle color="light" className="w-100 text-start">
              {filters.region ? `Regione: ${filters.region}` : "Tutte le regioni"}
            </MDBDropdownToggle>
            <MDBDropdownMenu>
              <MDBDropdownItem link onClick={() => setFilters(p => ({ ...p, page: 1, region: "" }))}>
                — Tutte —
              </MDBDropdownItem>
              <>
                {regionOptions.map(r => (
                  <MDBDropdownItem key={r} link onClick={() => setFilters(p => ({ ...p, page: 1, region: r }))}>
                    {r}
                  </MDBDropdownItem>
                ))}
              </>
            </MDBDropdownMenu>
          </MDBDropdown>
        </MDBCol>

        {/* State */}
        <MDBCol xs="6" md="3" lg="3">
          <MDBDropdown className="w-100">
            <MDBDropdownToggle color="light" className="w-100 text-start">
              {filters.state ? `Stato: ${filters.state}` : "Tutti gli stati (Paese)"}
            </MDBDropdownToggle>
            <MDBDropdownMenu>
              <MDBDropdownItem link onClick={() => setFilters(p => ({ ...p, page: 1, state: "" }))}>
                — Tutti —
              </MDBDropdownItem>
              <>
                {stateOptions.map(s => (
                  <MDBDropdownItem key={s} link onClick={() => setFilters(p => ({ ...p, page: 1, state: s }))}>
                    {s}
                  </MDBDropdownItem>
                ))}
              </>
            </MDBDropdownMenu>
          </MDBDropdown>
        </MDBCol>
      </MDBRow>

      <FormAlert />

      {/* Lista */}
      <MDBRow className="mb-4">
        <MDBCard className="border rounded-2 bg-white">
          <div
            className="d-grid fw-semibold text-muted px-3 py-3 border-bottom"
            style={{ gridTemplateColumns: "2fr 2fr 2fr 1fr 1fr 0.8fr", fontSize: "0.9rem" }}
          >
            <div><MDBIcon fas icon="truck" className="me-2 text-success" />Fornitore</div>
            <div><MDBIcon fas icon="envelope" className="me-2 text-success" />Contatti</div>
            <div><MDBIcon fas icon="file-invoice" className="me-2 text-success" />Info</div>
            <div><MDBIcon fas icon="location-dot" className="me-2 text-success" />Regione</div>
            <div><MDBIcon fas icon="globe" className="me-2 text-success" />Stato</div>
            <div><MDBIcon fas icon="cogs" className="me-2 text-success" />Azioni</div>
          </div>

          {loading && (
            <div className="d-flex align-items-center justify-content-center gap-3 py-4">
              <General_Loading theme="formLoading" text="Caricamento Fornitori" />
            </div>
          )}

          {!loading && error && (
            <div className="text-danger p-3 d-flex align-items-center gap-2">
              <MDBIcon fas icon="exclamation-triangle" /> {error}
              <MDBBtn size="sm" color="danger" className="ms-2" onClick={fetchSuppliersOnDemand}>
                <MDBIcon fas icon="redo" className="me-2" />Riprova
              </MDBBtn>
            </div>
          )}

          {!loading && !error && suppliers.length === 0 && (
            <div className="text-muted p-3">Nessun fornitore trovato</div>
          )}

          {!loading && !error && suppliers.map((s, i) => (
            <div
              key={s.supplier_uid}
              className="d-grid align-items-center px-3 py-3"
              style={{
                gridTemplateColumns: "2fr 2fr 2fr 1fr 1fr 0.8fr",
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: i % 2 === 0 ? "#fff" : "#fcfcfc",
              }}
            >
              {/* Fornitore */}
              <div className="d-flex flex-column align-items-start">
                <div className="fw-bold">{s.company_name}</div>
                <div className="small">
                  {(s.indirizzo || "")}
                  {(s.city || s.cap) && <>, {s.city} {s.cap ? `(${s.cap})` : ""}</>}
                  {s.province && <> – {s.province}</>}
                </div>
              </div>

              {/* Contatti */}
              <div className="small">
                {s.ref_name && <div><MDBIcon fas icon="user" className="me-2 text-muted" />{s.ref_name}</div>}
                {s.ref_email && <div><MDBIcon fas icon="envelope" className="me-2 text-muted" />{s.ref_email}</div>}
                {s.ref_phone && <div><MDBIcon fas icon="phone" className="me-2 text-muted" />{s.ref_phone}</div>}
              </div>

              {/* Info */}
              <div className="small">
                {s.piva && <div className="d-flex flex-row gap-2"><p className="text-muted mb-0">P.Iva:</p> {s.piva}</div>}
                {s.cf && <div className="d-flex flex-row gap-2"><p className="text-muted mb-0">CF:</p> {s.cf}</div>}
              </div>

              {/* Regione */}
              <div className="small">
                <MDBBadge color="light" className="border text-dark me-2">{s.region || "—"}</MDBBadge>
              </div>

              {/* Stato */}
              <div className="small">
                <MDBBadge color="light" className="border text-dark">{s.state || "—"}</MDBBadge>
              </div>

              {/* Azioni */}
              <div className="d-flex gap-2">
                <MDBBtn
                  size="sm"
                  color="link"
                  className="text-muted p-0"
                  onClick={() => { setSelected(s); setEditOpen(true); }}
                >
                  <MDBIcon fas icon="pen" />
                </MDBBtn>
                <MDBBtn size="sm" color="link" className="text-muted p-0" onClick={() => { handleDelete(s.supplier_uid) }}>
                  <MDBIcon fas icon="trash" />
                </MDBBtn>
              </div>
            </div>
          ))}
        </MDBCard>
      </MDBRow>

      {/* Pagination */}
      <div className="d-flex justify-content-end align-items-center p-3">
        <Pagination
          setCurrentPage={(page) => setFilters(prev => ({ ...prev, page }))}
          currentPage={filters.page ?? 1}
          totalPages={Math.max(1, Math.ceil((total || 0) / (filters.per_page || 25)))}
        />
      </div>

      {/* MODALE CREATE */}
      <MDBModal tabIndex="-1" open={createOpen} setOpen={setCreateOpen}>
        <MDBModalDialog centered size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Nuovo Fornitore</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={toggleCreate}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <GeneralForm<APISupplier, { project_uid: string }>
                params={{ project_uid }}
                mode="create"
                fields={Supplier_FormFields}
                createData={create_supplier}
                onSuccess={async () => {
                  toggleCreate();
                  await fetchSuppliersOnDemand(); // refresh on-demand
                }}
              />
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* MODALE UPDATE */}
      <MDBModal tabIndex="-1" open={editOpen} setOpen={setEditOpen}>
        <MDBModalDialog centered size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Modifica Fornitore</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={toggleEdit}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              {selected && (
                <GeneralForm<APISupplier, {}>
                  mode="update"
                  fields={Supplier_FormFields}
                  data={selected}
                  updateData={update_supplier}
                  onSuccess={async () => {
                    toggleEdit();
                    await fetchSuppliersOnDemand(); // refresh on-demand
                  }}
                />
              )}
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* MODALE IMPORT FORNITORI */}
      <MDBModal tabIndex="-1" open={importModalOpen} setOpen={setImportModalOpen}>
        <MDBModalDialog centered size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{dryRun ? 'Anteprima Import (Dry-Run)' : 'Import Fornitori'}</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={toggleImportModal}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              {/* STEP 1: form upload */}
              {!dryRun && (
                <GeneralForm<ImportForm, {}>
                  mode="create"
                  fields={Import_FormFields}
                  createData={async (payload) => {
                    const ok = await onImportSubmit(payload);
                    return ok
                      ? { response: { success: true, message: 'File caricato. Eseguita simulazione.' } }
                      : { response: { success: false, message: 'Errore import.' } };
                  }}
                  createBtnProps={{ label: "Carica & Simula", labelSaving: "Elaborazione..." }}
                  onSuccess={() => { /* gestito dallo stato locale */ }}
                />
              )}

              {/* STEP 2: report + conferma */}
              {dryRun && (
                <DryRunReport
                  report={dryRun.report}
                  onClose={() => setImportModalOpen(false)}
                  onConfirm={onConfirmCommit}
                  confirming={commitLoading}
                />
              )}
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
};

export default FornitoriLista;
