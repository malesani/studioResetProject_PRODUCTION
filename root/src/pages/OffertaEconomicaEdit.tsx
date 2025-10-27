import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';

import General_Loading from "../app_components/General_Loading";
import { GeneralForm, FieldConfig } from "../app_components/GeneralForm";
import { GeneralInput } from "../app_components/GeneralInput";
import { General_ContentSwitcher, ContentConfig } from '../app_components/General_ContentSwitcher';

import {
  MDBContainer, MDBIcon, MDBRow, MDBCard,
  MDBCol,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBModal,
  MDBModalDialog, MDBModalContent, MDBModalHeader,
  MDBModalTitle, MDBModalBody,
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownMenu,
  MDBDropdownToggle,

} from "mdb-react-ui-kit";

import { TableFilters } from '../app_components/TableData/interfaces';

import { EstimateItem, EstimateInfo, get_estimateByUid, update_estimate, get_estimateItemsListPaginated, bulk_replace_estimate_items } from "../api_module/estimates/EstimatesRequest"

import { APIProduct, get_productsListPaginated } from '../api_module/products/ProductsRequest';


// -------------------- Tipos compartidos --------------------
type OffertaEconomicaEditProps = {
  preventivo_uid: string;
};

interface DataResponse<T> {
  data: T;
  response: {
    success: boolean;
    message: string;
  };
}


type CategoryTree = Record<string, string[]>;


// -------------------- Mock iniziale --------------------
const custDataResponse: DataResponse<EstimateInfo> = {
  data: {
    project_uid: '7m56neK6',
    preventivo_uid: "showroom",
    customer_uid: "Azienda Prova 1",
    tipo: "Show room",
    fiera: "host-milano-2025",
    stato: "attivo",
    validitaFino: "2025-11-10",
    descrizione: "Preventivo di prova per test frontend",
    titolo: "Preventivo Mock",
    importo: "1200",
    note: "lorem lorem lorem",
  },
  response: {
    success: true,
    message: "Mock data caricata con successo",
  },
};



const OffertaEconomicaEdit: React.FC<OffertaEconomicaEditProps> = () => {

  const { preventivo_uid: preventivo_uid } = useParams<{ preventivo_uid: string }>();
  if (!preventivo_uid) {
    return (<div className="alert alert-danger">
      UID del Preventivo mancante
    </div>);  // o qualsiasi fallback
  }

  const navigate = useNavigate();

  // ---------------- UI State ----------------
  const [loadingPage, setLoadingPage] = useState<boolean>(false);
  const [errorPage, setErrorPage] = useState<string | null>(null);

  // DATA STATES
  const [estimate_info, setEstimateInfo] = useState<EstimateInfo>({} as EstimateInfo);


  const [categoryTree, setCategoryTree] = useState<CategoryTree>({
    "Categoria 1": ["subCat 1_1", "subCat 1_2", "subCat 1_3"],
    "Categoria 2": ["subCat 2_1", "subCat 2_2", "subCat 2_3"],
    "Categoria 3": ["subCat 3_1", "subCat 3_2", "subCat 3_3"],
  });


  //categorie e sottocategorie per filtri prdotti in add prodotto
  const [productFilters, setProductFilters] = useState<TableFilters<APIProduct>>({
    // Base su DEFtableMeta ma senza pages_num
    page: 1,
    per_page: 50, // per coerenza con il tuo default precedente
    search: "",
    category: "",
    subCategory: "",
  });

  const categories = useMemo(() => Object.keys(categoryTree), [categoryTree]);
  const subCategories = useMemo(() => {
    const cat = productFilters.category || "";
    return cat ? categoryTree[cat] ?? [] : [];
  }, [categoryTree, productFilters.category]);



  //product list per caricamento table edit



  //prodotti ciclati nella tabella se esistono e quando aggiungo
  const [productList, setProductList] = useState<EstimateItem[]>([]);

  //con prodottti caricati dal filtro categoria
  const [products_list_category, setProductsListCategory] = useState<APIProduct[]>([] as APIProduct[]);



  const [modalOpen, setModalOpen] = useState(false);

  const [loadingMode_products, setLoading_products] = useState<boolean>(false);
  const [error_products, setError_products] = useState<string | null>(null);


  // First splash load

  // caricamento prodotti all'interno del preventivo
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingPage(true);
      setErrorPage(null);
      try {
        const args = {
          page: 1,
          per_page: 500,
          preventivo_uid: preventivo_uid
        };
        const response = await get_estimateItemsListPaginated(args);

        console.log(response, "product preventivo ")

        if (!isMounted) return;
        if (response.success && response.data) {
          setProductList(response.data.rows);
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
  }, []);

  //caricamento info preventivo per id 
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingPage(true);
      setErrorPage(null);
      try {
        const response = await get_estimateByUid({ preventivo_uid: preventivo_uid! });
        if (!isMounted) return;
        if (response.response.success && response.response.data) {
          setEstimateInfo(response.response.data);
        } else {
          setErrorPage(response.response.message || "Errore generico");
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

  //invio grid dei prodotti dentro alla table
  async function saveProducts() {
    
    // ✅ Validamos que preventivo_uid exista
    if (!preventivo_uid) {
      console.error("preventivo_uid mancante!");
      setErrorPage("Impossibile salvare: preventivo UID mancante");
      return;
    }

    try {
      const response = await bulk_replace_estimate_items(preventivo_uid, productList);

      if (response.response.success && response.response.data) {
        setEstimateInfo(response.response.data);
      } else {
        setErrorPage(response.response.message || "Errore generico");
      }
    } catch (err: any) {
      console.error("Errore durante il salvataggio prodotti:", err);
      setErrorPage("Errore durante il salvataggio dei prodotti");
    } finally {
      console.log("Prodotti inviati:", productList);
    }
  }

  //chiamata per ottenere prodotti filtrati per categoria + apertura modal
  const handleNew = async () => {
    await fetchProdottiCategori();
    setModalOpen(true); // ✅ abre el modal después de cargar
  };


  const handleCloseModal = () => {
    setModalOpen(false); // 👈 cierra el modal
  };

  //se cambia un prodotto nella tabella
  const handleProductChange = (index: number, name: string, value: any) => {
    setProductList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };


  const handleSelectCategory = (value: string) => {
    setProductFilters(prev => ({
      ...prev,
      category: value,
      subCategory: "", // reset sottocategoria quando cambia la categoria
    }));
  };

  const handleSelectSubCategory = (value: string) => {
    setProductFilters(prev => ({
      ...prev,
      subCategory: value,
    }));
  };


  const Product_FormFields: FieldConfig<EstimateInfo>[] = [
    {
      name: "customer_uid",
      label: "Clienti",
      required: true,
      grid: { md: 6 },
      type: "selectbox",
      options: [
        { text: "Azienda Prova 1", value: "Azienda Prova 1" },
        { text: "Azienda Prova 2", value: "Azienda Prova 2" },
        { text: "Azienda Prova 3", value: "Azienda Prova 3" },
        { text: "Azienda Prova 4", value: "Azienda Prova 4" },
      ],
      properties: { multiple: false },
    },
    {
      name: "tipo",
      label: "Tipo Preventivo",
      required: true,
      grid: { md: 6 },
      type: "selectbox",
      options: [
        { text: "Show room", value: "Show room" },
        { text: "Azienda Prova 2", value: "Azienda Prova 2" },
        { text: "Azienda Prova 3", value: "Azienda Prova 3" },
        { text: "Azienda Prova 4", value: "Azienda Prova 4" },
      ],

    },
    {
      name: "fiera",
      label: "Fiera",
      required: true,
      grid: { md: 4 },
      type: "selectbox",
      options: [
        { text: "Host Milano 2025", value: "host-milano-2025" },
        { text: "MIDO Eyewear Show", value: "mido-eyewear-show" },
        { text: "EIMA International 2026", value: "eima-2026" },
      ],
      properties: { multiple: false },

    },
    {
      name: "stato",
      label: "Stato",
      required: true,
      grid: { md: 4 },
      type: "selectbox",
      options: [{ text: "attivo", value: "attivo" }],
      properties: { multiple: false },
    },
    {
      name: "validitaFino",
      label: "Validità fino",
      required: true,
      grid: { md: 4 },
      type: "text",
    },
    {
      name: "descrizione",
      label: "Descrizione dettagliata del prodotto",
      required: true,
      type: "text_area",
      grid: { md: 12 },
    },
    {
      name: "titolo",
      label: "Titolo Preventivo",
      required: true,
      grid: { md: 6 },
      type: "text",

    },
    { name: "importo", label: "Importo", required: true, grid: { md: 6 }, type: "number" },
    {
      name: "note",
      label: "Note aggiuntive, condizioni, termini di pagamento, clausole speciali…",
      required: true,
      type: "text_area",
      grid: { md: 12 },
    },
  ];

  const contents: ContentConfig[] = [
    {
      icon: 'bell',
      title: 'Item Preventivo',
      startOpen: false,
      contentElement: (
        <>
          <MDBCard className="mt-2 px-4 mb-3">
            <MDBContainer className="mt-4">
              <MDBRow className="align-items-center g-2 mb-4">
                {/* Select Categoria */}
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

                {/* Bottone Nuovo */}
                <MDBCol size='4'>
                  <MDBBtn color="success" rounded onClick={handleNew}>
                    Nuovo
                  </MDBBtn>
                </MDBCol>
              </MDBRow>
            </MDBContainer>
          </MDBCard>

          <MDBCard className="mt-2 p-4">
            <MDBContainer className="mt-4">
              <MDBRow className="d-flex justify-content-end mb-4">
                <MDBCol size="auto">
                  <MDBBtn rounded onClick={saveProducts}>
                    <MDBIcon className="me-3" fas icon="save" />
                    Salva
                  </MDBBtn>
                </MDBCol>
              </MDBRow>
              <MDBRow className="overflow-auto">
                <MDBTable align='middle'>
                  <MDBTableHead>
                    <tr>
                      <th scope="col">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                        </div>
                      </th>
                      <th scope='col'>Codice Articolo</th>
                      <th scope='col'>UM</th>
                      <th scope='col'>Qta</th>
                      <th scope='col'>Descrizione</th>
                      <th scope='col'>Prezzo Noleggio</th>
                      <th scope='col'>Prezzo vendita</th>
                      <th scope='col'>Prezzo Rimont.</th>
                      {/* <th scope='col'>Tot.Noleggio</th>
                      <th scope='col'>Tot.Vendita</th>
                      <th scope='col'>Tot.Rimontaggio</th> */}
                      <th scope='col'>FP</th>
                      <th scope='col'>N</th>
                      <th scope='col'>V</th>
                      <th scope='col'>R</th>
                      <th scope='col'>Categoria</th>
                      <th scope='col'>Sotto Categoria</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody >
                    {productList.map((prod, index) => (
                      <tr key={index}>
                        <td>

                        </td>
                        <td>
                          <GeneralInput<EstimateItem>
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "art_code",
                              label: "",
                              required: true,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput<EstimateItem>
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "name",
                              label: "",
                              required: true,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "um",
                              label: "",
                              required: false,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "quantity",
                              label: "",
                              required: true,
                              type: "number",
                              properties: {
                                defaultValue: 1

                              }
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "description",
                              label: "",
                              required: false,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "rental_price",
                              label: "",
                              required: false,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "selling_price",
                              label: "",
                              required: false,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "mount_price",
                              label: "",
                              required: false,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        {/* <td>
                          <GeneralInput<EstimateItem>
                            field={{
                              name: "rental_price_total",
                              label: "",
                              required: false,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td> */}
                        {/* <td>
                          <GeneralInput<EstimateItem>
                            field={{
                              name: "selling_price_total",
                              label: "",
                              required: false,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td> */}
                        {/* <td>
                          <GeneralInput<EstimateItem>
                            field={{
                              name: "mount_price_total",
                              label: "",
                              required: false,
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td> */}
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "FP",
                              label: "",
                              type: "checkbox",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "N",
                              label: "",
                              type: "checkbox",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "V",
                              label: "",
                              type: "checkbox",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "R",
                              label: "",
                              type: "checkbox",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "category",
                              label: "",
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                        <td>
                          <GeneralInput
                            style={{ width: "100px" }} // 👈 aquí controlas el ancho
                            field={{
                              name: "subCategory",
                              label: "",
                              type: "text",
                            }}
                            formData={prod}
                            onChange={(name, value) => handleProductChange(index, name, value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </MDBTableBody>
                </MDBTable>
              </MDBRow>
            </MDBContainer>
          </MDBCard>
        </>
      ),
    },
    {
      icon: 'plus-square',
      title: 'Aggiuntive',
      startOpen: true,
      contentElement: (
        <MDBCard className="mt-2 p-4">

        </MDBCard>
      ),
    }
  ];




  //chiamata per ottenere prodotti filtrati per categoria
  async function fetchProdottiCategori() {
    console.log('📦 Simulando chiamata API: GET /api/categorie');
    try {
      const args = {
        page: 1,
        per_page: 500,
        category: productFilters.category || undefined,
        subCategory: productFilters.subCategory || undefined,
      };
      const response = await get_productsListPaginated(args);
      if (response.success) {
        setProductsListCategory(response.data!.rows);
        // se hai meta dal backend, qui potresti aggiornare pages_num ecc.
      } else {
        setError_products(response.message || "Errore nel recupero prodotti");
      }
    } catch (err: any) {
      setError_products(err.message || "Errore di rete");
    } finally {
      setLoading_products(false);
    }
  }

  //chiamata per ottenere prodotti del preventivo
  // async function fetchProdotti(): Promise<DataResponse<EstimateItem[]>> {
  //   console.log('📦 Simulando chiamata API: GET /api/categorie');
  //   await new Promise((resolve) => setTimeout(resolve, 500));
  //   return productsDataResponse;
  // }


  // useEffect(() => {
  //   if (!categorieSelezionate.length) {
  //     setSottocategorieFiltrate([]);
  //     return;
  //   }

  //   // Combinar subcategorías de todas las categorías seleccionadas
  //   const sottos: Sottocategoria[] = categorieSelezionate.flatMap(catId => {
  //     const categoria = categorie.find(c => c.id === catId);
  //     return categoria?.sottocategorie || [];
  //   });

  //   // Quitar duplicados por id
  //   const uniche = Array.from(new Map(sottos.map(s => [s.id, s])).values());

  //   setSottocategorieFiltrate(uniche);
  // }, [categorieSelezionate, categorie]);
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // ---------------- Render ----------------
  if (errorPage) return <div className="text-danger">Errore: {errorPage}</div>;
  if (loadingPage) return <General_Loading theme="pageLoading" />;

  return (
    <MDBContainer className="py-4">
      <MDBRow className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <MDBBtn color='dark' onClick={() => { navigate(`/project/economic_offert/list/${encodeURIComponent(custDataResponse.data.project_uid)}`) }}>
              <MDBIcon fas icon="arrow-left" />
            </MDBBtn>
          </div>
        </div>
      </MDBRow>

      <MDBRow className="mb-4">
        <GeneralForm<EstimateInfo>
          title="Modifica o Aggiungi Materiali al tuo Preventivo"
          mode="update"
          fields={Product_FormFields}
          data={estimate_info}
          updateData={update_estimate}
          onSuccess={(updated) => {
            console.log("Aggiornato:", updated);
          }}
        />
      </MDBRow>

      <MDBRow className="mb-4">

        <h4>
          <MDBIcon className="me-3" fas icon="shopping-basket" />
          Prodotti Preventivo
        </h4>
        <General_ContentSwitcher switchMode='tabs' properties={{ pills: true, fill: true }} contents={contents} />
      </MDBRow>
      <MDBModal open={modalOpen} setOpen={setModalOpen} tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Aggiunta Prodotti</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={handleCloseModal}></MDBBtn>
            </MDBModalHeader>

            <MDBModalBody>
              <h4>Categoria</h4>
              <p> { }</p>
              <h4>Sotto Categoria</h4>
              <p>{ }</p>
              <GeneralForm<EstimateItem>
                mode="create"
                fields={[
                  {
                    name: "name",
                    label: "Nome prodotto",
                    required: true,
                    grid: { md: 12 },
                    type: "selectbox",
                    options: products_list_category.map(prod => ({
                      value: prod.art_code,
                      text: prod.name,
                    })),
                    properties: { multiple: true },
                  },
                ]}

                createData={async (payload: any): Promise<DataResponse<EstimateItem>> => {

                  const selectedCodes = Array.isArray(payload?.name) ? payload.name : [payload?.name].filter(Boolean);

                  const selectedProducts = products_list_category.filter(prod => selectedCodes.includes(prod.art_code));

                  console.log(selectedProducts)
                  //salvo il prodotto/s selezionato/s se mi serve altrove

                  setProductList((prev => [...prev, ...selectedProducts as EstimateItem[]]));

                  return Promise.resolve({
                    data: payload,
                    response: { success: true, message: "Prodotto aggiunto correttamente" },
                  });
                }}
              />
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>

  );
};

export default OffertaEconomicaEdit;
