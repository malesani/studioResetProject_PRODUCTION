import React, { useEffect, useMemo, useRef, useState } from "react";
import General_Loading from "../app_components/General_Loading";
import { GeneralForm, FieldConfig, SelectData } from "../app_components/GeneralForm";
import { TableFilters } from '../app_components/TableData/interfaces';

import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
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
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBModalDialog,
  MDBModalHeader,
  MDBModalTitle,
  MDBBtnGroup,
} from "mdb-react-ui-kit";

import Pagination from "../app_components/TableData/components/Pagination";

import { APIProduct, create_product, update_product, get_productsListPaginated, get_categoryTree } from '../api_module/products/ProductsRequest';
import { Import_FormFields, ImportForm, upload_import_products, run_import_products, UploadResp, RunResp } from '../app_components/imports/ImportsRequest';
import DryRunReport from '../app_components/imports/DryRunReport';

export interface ObjectivesListProps {
  project_uid: string;
}

type CategoryTree = Record<string, string[]>;

const MaterialiList: React.FC<ObjectivesListProps> = ({ project_uid }) => {
  const [loadingMode, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // Gestione Modali
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const toggleCreateModal = () => setCreateModalOpen(!createModalOpen);

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<APIProduct | null>(null);

  const onClickEdit = (row: APIProduct) => {
    setSelectedProduct(row);
    setEditModalOpen(true);
  };

  const toggleEditModal = () => {
    setEditModalOpen((o) => !o);
    if (editModalOpen) setSelectedProduct(null); // reset quando chiudi
  };

  // DATA
  const [total_products, setTotalProducts] = useState<number>(0);
  const [products_list, setProductsList] = useState<APIProduct[]>([] as APIProduct[]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree>({} as CategoryTree);


  // Gestione Filtri
  const [productFilters, setProductFilters] = useState<TableFilters<APIProduct>>({
    // Base su DEFtableMeta ma senza pages_num
    page: 1,
    per_page: 50, // per coerenza con il tuo default precedente
    search: "",
    category: "",
    subCategory: "",
  });
  const [loadingMode_products, setLoading_products] = useState<boolean>(false);
  const [error_products, setError_products] = useState<string | null>(null);

  const [searchDraft, setSearchDraft] = useState<string>(productFilters.search ?? "");
  const categories = useMemo(() => Object.keys(categoryTree), [categoryTree]);
  const subCategories = useMemo(() => {
    const cat = productFilters.category || "";
    return cat ? categoryTree[cat] ?? [] : [];
  }, [categoryTree, productFilters.category]);

  // Debounce searchDraft → productFilters.search
  useEffect(() => {
    const t = setTimeout(() => {
      setProductFilters(prev => ({
        ...prev,
        page: 1,             // ogni volta che cambia la ricerca, torna a pagina 1
        search: searchDraft, // aggiorna il filtro effettivo
      }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchDraft]);

  // Handlers filtri UI → productFilters
  const handleSelectCategory = (value: string) => {
    setProductFilters(prev => ({
      ...prev,
      page: 1,
      category: value,
      subCategory: "", // reset sottocategoria quando cambia la categoria
    }));
  };

  const handleSelectSubCategory = (value: string) => {
    setProductFilters(prev => ({
      ...prev,
      page: 1,
      subCategory: value,
    }));
  };

  const setCurrentPage = (page: number) => {
    setProductFilters(prev => ({ ...prev, page }));
  };

  const setRowsForPage = (per_page: number) => {
    setProductFilters(prev => ({
      ...prev,
      per_page,
      page: 1, // cambio righe/pagina: reset pagina
    }));
  };

  // helper per convertire string[] in SelectData[]
  const toOptions = (arr: string[], defaultVal?: string) =>
    arr.map((s) => ({
      text: s,
      value: s,
      ...(defaultVal !== undefined && s === defaultVal ? { defaultSelected: true } : {}),
    }));

  const categoryOptions: SelectData[] = useMemo(
    () => [...toOptions(Object.keys(categoryTree))],
    [categoryTree]
  );

  // ---------- CREATE ----------
  const CreateProduct_FormFields: FieldConfig<APIProduct>[] = [
    // ── Info generali ────────────────────────────────────────────────────────────
    {
      name: "art_code",
      label: "Codice Prodotto",
      type: "text",
      grid: { md: 6 },
      validationFeedback: { invalid: "Codice non valido." },
      properties: { placeholder: "Es. PRD-20250103-001" },
      extraElements: [
        {
          position: "before",
          grid: { md: 12 },
          element: (
            <div className="d-flex align-items-center mb-1">
              <MDBIcon fas icon="info-circle" className="me-2" />
              <h5 className="fs-6 fw-semibold mb-0">Info generali</h5>
            </div>
          ),
        },
      ],
    },
    {
      name: "name",
      label: "Nome del Prodotto",
      required: true,
      type: "text",
      grid: { md: 6 },
      properties: { placeholder: "Es. Pannello isolante XPS" },
    },
    {
      name: "category",
      label: "Categoria",
      required: true,
      grid: { md: 6 },
      type: "selectbox",
      // autonomo: prende dall'albero locale
      options: categoryOptions,
      properties: {
        multiple: false,
        hideChoseSomething: true,
        placeholder: "Seleziona categoria",
        preventFirstSelection: false
      },
    },
    // dipendente: si aggiorna quando cambia 'category'
    {
      name: "subCategory",
      label: "Sottocategoria",
      required: false,
      grid: { md: 6 },
      type: "selectbox",
      dependencies: ["category", "subCategory"],
      getOptions: (formData) => {
        const cat = formData.category ?? "";
        const current = formData.subCategory ?? "NULL";
        const list = cat ? (categoryTree[cat] ?? []) : [];

        // prima l'opzione NULL con selezione condizionata
        const opts: SelectData[] = [
          { text: "— Nessuna —", value: "NULL", ...(current === "NULL" ? { defaultSelected: true } : {}) },
          // poi le opzioni reali con defaultSelected sulla corrente
          ...list.map((s) => ({
            text: s,
            value: s,
            ...(current === s ? { defaultSelected: true } : {}),
          })),
        ];

        return opts;
      },
      properties: {
        multiple: false,
        hideChoseSomething: true,
        disabled: false,
        placeholder: "Filtra Sotto Categoria",
      },
    },
    {
      name: "um",
      label: "Unità di Misura",
      required: true,
      grid: { md: 12 },
      type: "text",
    },

    // ── Prezzi ───────────────────────────────────────────────────────────────────
    {
      name: "purchase_price",
      label: "Costo",
      required: true,
      type: "number",
      grid: { md: 4 },
      properties: { minValue: 0, stepValue: 0.01 },
      extraElements: [
        {
          position: "before",
          grid: { md: 12 },
          element: (
            <div className="d-flex align-items-center mt-2">
              <MDBIcon fas icon="euro-sign" className="me-2" />
              <h5 className="fs-6 fw-semibold mb-0">Prezzi</h5>
            </div>
          ),
        },
      ],
    },
    {
      name: "selling_price",
      label: "Prezzo Vendita",
      required: true,
      type: "number",
      grid: { md: 4 },
      properties: { minValue: 0, stepValue: 0.01 },
    },
    {
      name: "rental_price",
      label: "Prezzo Noleggio",
      required: false,
      type: "number",
      grid: { md: 4 },
      properties: { minValue: 0, stepValue: 0.01 },
    },

    // ── Dimensioni e Peso ───────────────────────────────────────────────────────
    {
      name: "dim_X",
      label: "Base",
      required: true,
      type: "number",
      grid: { md: 3 },
      properties: { minValue: 0, stepValue: 0.1 },
      extraElements: [
        {
          position: "before",
          grid: { md: 12 },
          element: (
            <div className="d-flex align-items-center">
              <MDBIcon fas icon="ruler-combined" className="me-2" />
              <h5 className="fs-6 fw-semibold mb-0">Dimensioni e peso</h5>
            </div>
          ),
        },
      ],
    },
    { name: "dim_Y", label: "Profondità", required: true, type: "number", grid: { md: 3 }, properties: { minValue: 0, stepValue: 0.1 } },
    { name: "dim_Z", label: "Altezza", required: true, type: "number", grid: { md: 3 }, properties: { minValue: 0, stepValue: 0.1 } },
    {
      name: "um_dim",
      label: "Unità di lunghezza",
      required: true,
      type: "selectbox",
      grid: { md: 3 },
      options: toOptions(["mm", "cm", "m"]),
      properties: { multiple: false, hideChoseSomething: true },
    },
    {
      name: "weigth",
      label: "Peso",
      required: false,
      type: "number",
      grid: { md: 3 },
      properties: { minValue: 0, stepValue: 0.01 },
    },
    {
      name: "um_weigth",
      label: "Unità di peso",
      required: false,
      type: "selectbox",
      grid: { md: 3 },
      options: toOptions(["g", "kg"]),
      properties: { multiple: false, hideChoseSomething: true },
    },

    // ── Fornitore ────────────────────────────────────────────────────────────────
    {
      name: "suppl_name",
      label: "Fornitore",
      type: "text",
      grid: { md: 6 },
      extraElements: [
        {
          position: "before",
          grid: { md: 12 },
          element: (
            <div className="d-flex align-items-center">
              <MDBIcon fas icon="truck" className="me-2" />
              <h5 className="fs-6 fw-semibold mb-0">Fornitore</h5>
            </div>
          ),
        },
      ],
      properties: { placeholder: "Ragione sociale" },
    },
    { name: "suppl_code", label: "Codice fornitore", type: "text", grid: { md: 6 }, properties: { placeholder: "Es. SUP-001" } },
    { name: "suppl_artCode", label: "Codice articolo fornitore", type: "text", grid: { md: 6 } },
    { name: "suppl_note", label: "Note fornitore", type: "text_area", grid: { md: 6 } },

    // ── Descrizione ─────────────────────────────────────────────────────────────
    {
      name: "description",
      label: "Descrizione dettagliata del prodotto",
      required: false,
      type: "text_area",
      grid: { md: 12 },
      hrBefore: true,
      properties: { placeholder: "Dettagli tecnici, campi d’impiego, ecc." },
    },
  ];

  // ---------- UPDATE ----------
  const UpdateProduct_FormFields: FieldConfig<APIProduct>[] = [
    // ── Info generali ────────────────────────────────────────────────────────────
    {
      name: "art_code",
      label: "Codice Prodotto",
      type: "text",
      readOnly: true,              // in update lo blocchiamo
      grid: { md: 6 },
      extraElements: [
        {
          position: "before",
          grid: { md: 12 },
          element: (
            <div className="d-flex align-items-center mb-1">
              <MDBIcon fas icon="info-circle" className="me-2" />
              <h5 className="fs-6 fw-semibold mb-0">Info generali</h5>
            </div>
          ),
        },
      ],
    },
    {
      name: "name",
      label: "Nome del Prodotto",
      required: true,
      type: "text",
      grid: { md: 6 },
    },
    {
      name: "category",
      label: "Categoria",
      required: true,
      grid: { md: 6 },
      type: "selectbox",
      options: categoryOptions,
      properties: { multiple: false, hideChoseSomething: true },
    },
    {
      name: "subCategory",
      label: "Sottocategoria",
      required: false,
      grid: { md: 6 },
      type: "selectbox",
      dependencies: ["category", "subCategory"],
      getOptions: (formData) => {
        const cat = formData.category ?? "";
        const current = formData.subCategory ?? "NULL";
        const list = cat ? (categoryTree[cat] ?? []) : [];

        // prima l'opzione NULL con selezione condizionata
        const opts: SelectData[] = [
          { text: "— Nessuna —", value: "NULL", ...(current === "NULL" ? { defaultSelected: true } : {}) },
          // poi le opzioni reali con defaultSelected sulla corrente
          ...list.map((s) => ({
            text: s,
            value: s,
            ...(current === s ? { defaultSelected: true } : {}),
          })),
        ];

        return opts;
      },
      properties: { multiple: false, hideChoseSomething: true },
    },
    {
      name: "um",
      label: "Unità di Misura",
      required: true,
      grid: { md: 12 },
      type: "selectbox",
      options: toOptions(["pz", "m", "cm", "mm", "kg", "g"]),
      properties: { multiple: false, hideChoseSomething: true },
    },

    // ── Prezzi ───────────────────────────────────────────────────────────────────
    {
      name: "purchase_price",
      label: "Costo",
      required: true,
      type: "number",
      grid: { md: 4 },
      properties: { minValue: 0, stepValue: 0.01 },
      extraElements: [
        {
          position: "before",
          grid: { md: 12 },
          element: (
            <div className="d-flex align-items-center mt-2">
              <MDBIcon fas icon="euro-sign" className="me-2" />
              <h5 className="fs-6 fw-semibold mb-0">Prezzi</h5>
            </div>
          ),
        },
      ],
    },
    {
      name: "selling_price",
      label: "Prezzo Vendita",
      required: true,
      type: "number",
      grid: { md: 4 },
      properties: { minValue: 0, stepValue: 0.01 },
    },
    {
      name: "rental_price",
      label: "Prezzo Noleggio",
      required: false,
      type: "number",
      grid: { md: 4 },
      properties: { minValue: 0, stepValue: 0.01 },
    },

    // ── Dimensioni e Peso ───────────────────────────────────────────────────────
    {
      name: "dim_X",
      label: "Base",
      required: true,
      type: "number",
      grid: { md: 3 },
      properties: { minValue: 0, stepValue: 0.1 },
      extraElements: [
        {
          position: "before",
          grid: { md: 12 },
          element: (
            <div className="d-flex align-items-center">
              <MDBIcon fas icon="ruler-combined" className="me-2" />
              <h5 className="fs-6 fw-semibold mb-0">Dimensioni e peso</h5>
            </div>
          ),
        },
      ],
    },
    { name: "dim_Y", label: "Profondità", required: true, type: "number", grid: { md: 3 }, properties: { minValue: 0, stepValue: 0.1 } },
    { name: "dim_Z", label: "Altezza", required: true, type: "number", grid: { md: 3 }, properties: { minValue: 0, stepValue: 0.1 } },
    {
      name: "um_dim",
      label: "Unità di lunghezza",
      required: true,
      type: "selectbox",
      grid: { md: 3 },
      options: toOptions(["mm", "cm", "m"]),
      properties: { multiple: false, hideChoseSomething: true },
    },
    {
      name: "weigth",
      label: "Peso",
      required: false,
      type: "number",
      grid: { md: 3 },
      properties: { minValue: 0, stepValue: 0.01 },
    },
    {
      name: "um_weigth",
      label: "Unità di peso",
      required: false,
      type: "selectbox",
      grid: { md: 3 },
      options: toOptions(["g", "kg"]),
      properties: { multiple: false, hideChoseSomething: true },
    },

    // ── Fornitore ────────────────────────────────────────────────────────────────
    {
      name: "suppl_name",
      label: "Fornitore",
      type: "text",
      grid: { md: 6 },
      extraElements: [
        {
          position: "before",
          grid: { md: 12 },
          element: (
            <div className="d-flex align-items-center">
              <MDBIcon fas icon="truck" className="me-2" />
              <h5 className="fs-6 fw-semibold mb-0">Fornitore</h5>
            </div>
          ),
        },
      ],
    },
    { name: "suppl_code", label: "Codice fornitore", type: "text", grid: { md: 6 } },
    { name: "suppl_artCode", label: "Codice articolo fornitore", type: "text", grid: { md: 6 } },
    { name: "suppl_note", label: "Note fornitore", type: "text_area", grid: { md: 6 } },

    // ── Descrizione ─────────────────────────────────────────────────────────────
    {
      name: "description",
      label: "Descrizione dettagliata del prodotto",
      required: false,
      type: "text_area",
      grid: { md: 12 },
      hrBefore: true,
    },
  ];



  // UTILITY: fetch on-demand con stati locali e retry
  const fetchProductsOnDemand = async () => {
    setLoading_products(true);
    setError_products(null);
    try {
      const args = {
        search: productFilters.search ?? "",
        page: productFilters.page ?? 1,
        per_page: productFilters.per_page ?? 50,
        category: productFilters.category || undefined,
        subCategory: productFilters.subCategory || undefined,
      };
      const response = await get_productsListPaginated(args);
      if (response.success) {
        setTotalProducts(response.data!.meta!.items_num ?? 0);
        setProductsList(response.data!.rows);
        // se hai meta dal backend, qui potresti aggiornare pages_num ecc.
      } else {
        setError_products(response.message || "Errore nel recupero prodotti");
      }
    } catch (err: any) {
      setError_products(err.message || "Errore di rete");
    } finally {
      setLoading_products(false);
    }
  };

  // Helper futuro per aggiornare manualmente l'albero categorie (non usato ora)
  const fetchCategoryTreeOnDemand = async () => {
    try {
      const res = await get_categoryTree();
      if (res.response.success && res.data) {
        setCategoryTree(res.data);
      } else {
        console.warn('updateCategoryTree:', res.response.message || 'Errore nel recupero categorie');
      }
    } catch (e: any) {
      console.error('updateCategoryTree exception:', e?.message || e);
    }
  };


  // Primo fetch (splash) una sola volta: carica CATEGORIE e LISTA insieme.
  // La pagina esce dal loading SOLO quando entrambe sono pronte.
  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const args = {
          search: productFilters.search ?? "",
          page: productFilters.page ?? 1,
          per_page: productFilters.per_page ?? 50,
          category: productFilters.category || undefined,
          subCategory: productFilters.subCategory || undefined,
        };

        // Carico categorie e lista IN PARALLELO,
        // ma la pagina esce dal loading solo quando entrambe sono pronte.
        const [catRes, listRes] = await Promise.all([
          get_categoryTree(),
          get_productsListPaginated(args),
        ]);

        if (!isMounted) return;

        // categorie: se falliscono, considero errore di pagina
        if (!catRes.response.success || !catRes.data) {
          throw new Error(catRes.response.message || "Errore nel recupero categorie");
        }
        setCategoryTree(catRes.data);

        // lista prodotti: se fallisce, considero errore di pagina
        if (listRes.success && listRes.data) {
          setTotalProducts(listRes.data!.meta!.items_num ?? 0);
          setProductsList(listRes.data.rows);
        } else {
          throw new Error(listRes.message || "Errore nel recupero prodotti");
        }
      } catch (err: any) {
        if (isMounted) setError(err?.message || "Errore di rete");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // On-demand fetch quando cambiano i filtri (solo dopo il primo caricamento)
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) { // salta al primo render (gestito da fetch iniziale)
      didInitRef.current = true;
      return;
    }
    fetchProductsOnDemand();
  }, [
    productFilters.search,
    productFilters.page,
    productFilters.per_page,
    productFilters.category,
    productFilters.subCategory,
  ]);

  /** IMPORT PRODOTTI - START */
  // stato locale:
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importUpload, setImportUpload] = useState<UploadResp | null>(null); // job_id + headers + mapping + preview
  const [dryRun, setDryRun] = useState<RunResp | null>(null);
  const [commitLoading, setCommitLoading] = useState(false);

  const toggleImportModal = () => {
    setImportModalOpen((o) => !o);
    if (!importModalOpen) {
      // reset quando la riapri
      setImportUpload(null);
      setDryRun(null);
      setCommitLoading(false);
    }
  };

  // handler submit form: esegue upload + dry-run
  async function onImportSubmit(fd: ImportForm) {
    // 1) upload (crea job e mapping)
    const up = await upload_import_products({
      ...fd,
      dry_run: true, // irrilevante qui, run lo chiamiamo sotto
    });

    if (!up.response.success || !up.data) {
      // opzionale: mostrare toast/alert
      return false; // GeneralForm → non chiudere
    }

    setImportUpload(up.data);

    // 2) run dry
    const rr = await run_import_products({
      job_id: up.data.job_id,
      mapping: up.data.mapping, // se in futuro avrai UI per mappare, passaci la mappa aggiornata
      dry_run: true,
    });

    if (!rr.response.success || !rr.data) {
      return false;
    }

    setDryRun(rr.data);
    return true;
  }

  // handler commit: conferma sincronizzazione
  async function onConfirmCommit() {
    if (!importUpload) return;
    setCommitLoading(true);
    const run = await run_import_products({
      job_id: importUpload.job_id,
      mapping: importUpload.mapping, // o mappa aggiornata
      dry_run: false,
    });
    setCommitLoading(false);

    if (run.response.success) {
      // chiudi modale, ricarica lista prodotti
      setImportModalOpen(false);
      setImportUpload(null);
      setDryRun(null);
      fetchProductsOnDemand(); // tua funzione già presente
    } else {
      // opzionale: mostrare errori
    }
  }
  /** IMPORT PRODOTTI - STOP */

  // SET ERROR
  if (error) return <div className="text-danger">Errore: {error}</div>;

  // SET LOADING
  if (loadingMode) {
    return (<General_Loading theme="pageLoading" />);
  }

  // CONTENT
  return (
    <>
      <MDBContainer className="py-4">
        {/* 📊 Header e statistiche */}
        <MDBRow className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold">Gestione Prodotti</h3>
              <p className="text-muted mb-0">
                Gestisci tutti i prodotti del sistema
              </p>
            </div>
            <MDBBtn onClick={toggleCreateModal} color="success">
              <MDBIcon fas icon="plus" className="me-2" /> Nuovo Prodotto
            </MDBBtn>
          </div>
        </MDBRow>

        <MDBRow className="mb-4">
          {/* Stat Cards */}
          <MDBCol md="3">
            <MDBCard className="border" style={{ backgroundColor: "#f0fcf7" }}>
              <MDBCardBody className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center rounded me-3"
                  style={{
                    backgroundColor: "#d7f5e4",
                    width: "45px",
                    height: "45px",
                  }}
                >
                  <MDBIcon fas icon="cube" size="lg" className="text-success" />
                </div>
                <div>
                  <p className="fw-semibold mb-1 text-success">
                    Prodotti Visualizzati
                  </p>
                  <h4 className="fw-bold text-success mb-0">{total_products}</h4>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol md="3">
            <MDBCard className="border" style={{ backgroundColor: "#f2f5ff" }}>
              <MDBCardBody className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center rounded me-3"
                  style={{
                    backgroundColor: "#e0e7ff",
                    width: "45px",
                    height: "45px",
                  }}
                >
                  <MDBIcon
                    fas
                    icon="layer-group"
                    size="lg"
                    className="text-primary"
                  />
                </div>
                <div>
                  <p className="fw-semibold mb-1 text-primary">Categorie</p>
                  <h4 className="fw-bold text-primary mb-0">
                    {Object.keys(categoryTree).length}
                  </h4>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol md="3">
            <MDBCard className="border" style={{ backgroundColor: "#f2f5ff" }}>
              <MDBCardBody className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center rounded me-3"
                  style={{
                    backgroundColor: "#e0e7ff",
                    width: "45px",
                    height: "45px",
                  }}
                >
                  <MDBIcon
                    fas
                    icon="layer-group"
                    size="lg"
                    className="text-primary"
                  />
                </div>
                <div>
                  <p className="fw-semibold mb-1 text-primary">Sotto Cat.</p>
                  <h4 className="fw-bold text-primary mb-0">
                    {new Set(Object.values(categoryTree).flat()).size}
                  </h4>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol md="3">
            <MDBCard className="border" style={{ backgroundColor: "#fff9f0" }}>
              <MDBCardBody className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center rounded me-3"
                  style={{
                    backgroundColor: "#ffe8d4",
                    width: "45px",
                    height: "45px",
                  }}
                >
                  <MDBIcon
                    fas
                    icon="file-import"
                    size="lg"
                    className="text-warning"
                  />
                </div>
                <div>
                  <p className="fw-semibold mb-1 text-warning">Last Sync</p>
                  <h4 className="fw-bold text-warning mb-0">
                    01/10/2025
                  </h4>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* 🔍 Filtro e azioni */}
        <MDBRow className="align-items-center bg-white p-3 rounded-2 border mb-4 g-2">
          <MDBCol xs="12" md="5" lg="6">
            <MDBInputGroup className="w-100">
              <span className="input-group-text bg-white border-end-0">
                <MDBIcon fas icon="search" />
              </span>
              <MDBInput
                type="text"
                placeholder="Cerca prodotti per Codice articolo o nome"
                className="border-start-0"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
            </MDBInputGroup>
          </MDBCol>

          <MDBCol xs="6" md="3" lg="2">
            {/* Dropdown Categoria */}
            <MDBDropdown className="w-100">
              <MDBDropdownToggle color="light" className="w-100 text-start">
                {productFilters.category ? `Categoria: ${productFilters.category}` : "Filtra Categoria"}
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                <>
                  <MDBDropdownItem link onClick={() => handleSelectCategory("")}>
                    — Tutte —
                  </MDBDropdownItem>
                  {categories.map((cat) => (
                    <MDBDropdownItem key={cat} link onClick={() => handleSelectCategory(cat)}>
                      {cat}
                    </MDBDropdownItem>
                  ))}
                </>
              </MDBDropdownMenu>
            </MDBDropdown>

          </MDBCol>


          <MDBCol xs="6" md="3" lg="2">
            {/* Dropdown Sotto Categoria */}
            <MDBDropdown className="w-100">
              <MDBDropdownToggle
                color="light"
                className="w-100 text-start"
                disabled={!productFilters.category}
                title={!productFilters.category ? "Seleziona prima una categoria" : ""}
              >
                {productFilters.subCategory ? `Sotto: ${productFilters.subCategory}` : "Filtra Sotto Categoria"}
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                <>
                  <MDBDropdownItem link onClick={() => handleSelectSubCategory("")}>
                    — Nessuna —
                  </MDBDropdownItem>
                  {subCategories.map((sub) => (
                    <MDBDropdownItem key={sub} link onClick={() => handleSelectSubCategory(sub)}>
                      {sub}
                    </MDBDropdownItem>
                  ))}
                </>
              </MDBDropdownMenu>
            </MDBDropdown>

          </MDBCol>


          <MDBCol
            xs="12"
            md="12"
            lg="2"
            className="d-flex justify-content-end flex-wrap"
          >
            <div className="d-flex gap-2">
              <MDBBtn color="light" className="px-3" title="Esporta">
                <MDBIcon fas icon="download" className="me-2" />
                Esporta
              </MDBBtn>
              <MDBBtn onClick={toggleImportModal} color="light" className="px-3" title="Importa">
                <MDBIcon fas icon="upload" className="me-2" />
                Importa
              </MDBBtn>
            </div>
          </MDBCol>
        </MDBRow>

        {/* products_list */}
        <MDBRow className="mb-4">
          <MDBCard className="border rounded-3 mb-3">
            <MDBTable align="middle" hover responsive className="mb-4">
              <MDBTableHead light>
                <tr className="fw-semibold text-muted" style={{ fontSize: "0.9rem" }}>
                  <th>
                    <MDBIcon fas icon="cube" className="me-2 text-success" />
                    Nome Prodotto
                  </th>
                  <th>
                    <MDBIcon fas icon="tags" className="me-2 text-success" />
                    Categoria
                  </th>
                  <th>
                    <MDBIcon fas icon="tags" className="me-2 text-success" />
                    Sottocategoria
                  </th>
                  <th>
                    <MDBIcon fas icon="dollar-sign" className="me-2 text-success" />
                    Costo
                  </th>
                  <th>
                    <MDBIcon fas icon="dollar-sign" className="me-2 text-success" />
                    Rivendita
                  </th>
                  <th>
                    <MDBIcon fas icon="dollar-sign" className="me-2 text-success" />
                    Noleggio
                  </th>
                  <th>
                    <MDBIcon fas icon="ruler-combined" className="me-2 text-success" />
                    Dimensioni
                  </th>
                  <th>
                    <MDBIcon fas icon="weight-hanging" className="me-2 text-success" />
                    Peso
                  </th>
                  <th>
                    <MDBIcon fas icon="cogs" className="me-2 text-success" />
                    Azioni
                  </th>
                </tr>
              </MDBTableHead>

              <MDBTableBody>
                {loadingMode_products && (
                  <tr>
                    <td colSpan={9} className="py-4">
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <General_Loading theme="formLoading" text="Caricamento Prodotti" />
                      </div>
                    </td>
                  </tr>
                )}

                {!loadingMode_products && error_products && (
                  <tr>
                    <td colSpan={9} className="py-4">
                      <div className="d-flex flex-column align-items-center justify-content-center gap-2">
                        <div className="text-danger">
                          <MDBIcon fas icon="exclamation-triangle" className="me-2" />
                          {error_products}
                        </div>
                        <MDBBtn color="danger" size="sm" onClick={fetchProductsOnDemand}>
                          <MDBIcon fas icon="redo" className="me-2" />
                          Riprova
                        </MDBBtn>
                      </div>
                    </td>
                  </tr>
                )}

                {!loadingMode_products && !error_products && products_list.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-4">
                      <div className="text-center text-muted">
                        <MDBIcon far icon="folder-open" className="me-2" />
                        Nessun prodotto trovato con i filtri correnti.
                      </div>
                    </td>
                  </tr>
                )}

                {!loadingMode_products && !error_products && products_list.length > 0 && (
                  <>
                    {products_list.map((p, i) => (
                      <tr
                        key={i}
                        style={{
                          backgroundColor: i % 2 === 0 ? "#fff" : "#fcfcfc",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        {/* Nome Prodotto */}
                        <td>
                          <div className="d-flex flex-column align-items-start">
                            <strong>{p.name}</strong>
                            <div className="text-muted small">{p.art_code}</div>
                          </div>
                        </td>

                        {/* Categoria */}
                        <td>
                          <MDBBadge color="light" pill className="border text-dark px-2 py-1">
                            {p.category}
                          </MDBBadge>
                        </td>

                        {/* Sottocategoria */}
                        <td>
                          <MDBBadge color="light" pill className="border text-dark px-2 py-1">
                            {p.subCategory}
                          </MDBBadge>
                        </td>

                        {/* Costo */}
                        <td>
                          <span className="fw-bold text-success">{p.purchase_price} €</span>
                          <div className="text-muted small">per {p.um}</div>
                        </td>

                        {/* Rivendita */}
                        <td>
                          <span className="fw-bold text-success">{p.selling_price} €</span>
                          <div className="text-muted small">per {p.um}</div>
                        </td>

                        {/* Noleggio */}
                        <td>
                          <span className="fw-bold text-success">{p.rental_price} €</span>
                          <div className="text-muted small">per {p.um}</div>
                        </td>

                        {/* Dimensioni */}
                        <td className="text-muted">
                          {(p.dim_X ?? 0)} x {(p.dim_Y ?? 0)} x {(p.dim_Z ?? 0)} {p.um_dim}
                        </td>

                        {/* Peso */}
                        <td className="text-muted">
                          {(p.weigth ?? 0)} {p.um_weigth}
                        </td>

                        {/* Azioni */}
                        <td>
                          <div className="d-flex gap-2">
                            <MDBBtn
                              size="sm"
                              color="link"
                              className="text-muted p-0"
                              onClick={() => onClickEdit(p)}
                            >
                              <MDBIcon fas icon="pen" />
                            </MDBBtn>
                            <MDBBtn size="sm" color="link" className="text-muted p-0">
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
            <div className="d-flex justify-content-between align-items-center p-3">
              <div className="w-10">
                <MDBBtnGroup>
                  <MDBDropdown>
                    <MDBDropdownToggle color="secondary" className="shadow-0" >
                      Per pagina {productFilters.per_page}
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                      <MDBDropdownItem onClick={() => setRowsForPage(10)} link>10</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setRowsForPage(25)} link>25</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setRowsForPage(50)} link>50</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setRowsForPage(100)} link>100</MDBDropdownItem>
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBBtnGroup>
              </div>

              <Pagination
                setCurrentPage={setCurrentPage}
                currentPage={productFilters.page ?? 1}
                totalPages={10 /* se lo ricevi dal backend, sostituisci con response.data.meta.pages_num */}
              />
            </div>

          </MDBCard>
        </MDBRow>
      </MDBContainer >

      {/* MODAL IMPORT */}
      < MDBModal tabIndex="-1" open={importModalOpen} setOpen={setImportModalOpen} >
        <MDBModalDialog centered size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>
                {dryRun ? 'Anteprima Import (Dry-Run)' : 'Import Prodotti'}
              </MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={toggleImportModal}></MDBBtn>
            </MDBModalHeader>

            <MDBModalBody>
              {/* STEP 1: form upload */}
              {!dryRun && (
                <GeneralForm<ImportForm, {}>
                  mode="create"
                  fields={Import_FormFields}
                  // NB: GeneralForm si aspetta DataResponse => ritorna true/false nel submit per mostrare feedback
                  createData={async (payload) => {
                    const ok = await onImportSubmit(payload);
                    // GeneralForm vuole DataResponse: ritorniamo un "ok" fittizio per mostrare Alert success
                    return ok
                      ? { response: { success: true, message: 'File caricato. Eseguita simulazione.' } }
                      : { response: { success: false, message: 'Errore import.' } };
                  }}
                  createBtnProps={{ label: "Carica & Simula", labelSaving: "Elaborazione..." }}
                  onSuccess={() => {/* noop: gestito da stato */ }}
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
      </MDBModal >


      {/* 💾 Modal per nuovo prodotto */}
      < MDBModal tabIndex="-1" open={createModalOpen} setOpen={setCreateModalOpen} >
        <MDBModalDialog centered size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Nuovo Prodotto</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={toggleCreateModal}
              ></MDBBtn>
            </MDBModalHeader>

            <MDBModalBody>
              <GeneralForm<APIProduct, { project_uid: string }>
                params={{ project_uid }}
                mode="create"
                fields={CreateProduct_FormFields}
                createData={create_product}
                onSuccess={(_fd) => {
                  toggleCreateModal();
                  // opzionale: ricarica
                  setProductFilters(prev => ({ ...prev })); // trigger refetch
                }}
              />
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal >

      {/* Modal per EDIT */}
      < MDBModal tabIndex="-1" open={editModalOpen} setOpen={setEditModalOpen} >
        <MDBModalDialog centered size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Modifica Prodotto</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={toggleEditModal}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              {selectedProduct && (
                <GeneralForm<APIProduct, {}>
                  mode="update"
                  fields={UpdateProduct_FormFields}
                  data={selectedProduct}
                  updateData={update_product}
                  onSuccess={() => {
                    toggleEditModal();
                    fetchProductsOnDemand();       // ricarica la lista
                  }}
                />
              )}
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal >

    </>
  );
};

export default MaterialiList;
