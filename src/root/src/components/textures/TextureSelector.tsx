import { textures } from './textures';

import {
  MDBRow,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBCardText,
  MDBCardTitle,
  MDBBadge
} from 'mdb-react-ui-kit';

import { useIsMobile } from "../../app_components/ResponsiveModule";

import { requestFunction, DataResponse } from '../../hooks/RequestFunction';

import { SelectData, GeneralForm } from '../../app_components/GeneralForm';


import { ObjectiveCard } from '../objectives/ObjectiveCard';


export interface ObjectivesListProps {
  project_uid: string;
}

export type TextureSelectorProps = {
  selectedTextures: string[];
  toggleTexture: (id: string) => void;
}

//tipo per chiamata momentanea
export interface APItextureData {
  project_uid: string;
  list_texture: textureObject[] | string[];
}

export interface textureObject {
  id: string;
  name: string,
  description: string,
  imageUrl: string,
  materials: string[];
}


export function TextureSelector({ selectedTextures, toggleTexture }: TextureSelectorProps, { project_uid }: ObjectivesListProps) {

  const isMobile = useIsMobile(992);


  //funzione per ottenere i dati finti ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async function getObjectiveData(
    params: { project_uid: string }
  ): Promise<DataResponse<APItextureData>> {

    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = {
      success: true, data: { texture_data: textures },
    };

    // Devuelve el formato esperado
    const data: APItextureData = {
      project_uid: params.project_uid,
      list_texture: response.data.texture_data || [],
    };

    return {
      response: {
        success: response.success,
        message: '',
      },
      data: data,
    };
  }


  async function updateObjectiveData(
    payload: APItextureData
  ): Promise<DataResponse<APItextureData>> {

    // Simula una llamada asíncrona (para no romper el componente)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Aquí puedes simular la actualización local (mock)
    const updated: APItextureData = {
      project_uid: payload.project_uid,
      list_texture: payload.list_texture,
    };

    // Simula la respuesta del "servidor"
    const response = {
      success: true,
      message: 'Objective data updated (mock)',
    };

    // Devuelve el formato esperado
    return {
      response,
      data: updated,
    };
  }

  const objetivesOptions: SelectData[] = textures.map(texture => ({
    value: texture.id,
    text: texture.name,
    renderCard: () => (
      // <ObjectiveCard
      //   objective={objective}
      //   isSelected={isSelected}
      //   onSelect={onSelect}
      // />
      <MDBCard className={"h-100 rounded hover-shadow " + (selectedTextures.includes(texture.id) && "shadow border border-primary border-2")}>
        <div
          className="position-relative cursor-pointer"
          onClick={() => toggleTexture(texture.id)}
        >
          {/* Immagine con aspect ratio 16:9 */}
          <MDBCardImage
            src={texture.imageUrl}
            alt={texture.name}
            className="w-100 rounded-top"
            style={{ aspectRatio: '16/9', objectFit: 'cover' }}
          />

          {/* Checkbox circolare in alto a destra se selezionata */}
          {selectedTextures.includes(texture.id) && (
            <span
              className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle bg-primary"
              style={{ width: '2rem', height: '2rem' }}
            >
              <i className="fas fa-check text-white"></i>
            </span>
          )}

          <MDBCardBody>
            <MDBCardTitle>{texture.name}</MDBCardTitle>
            <MDBCardText className="text-muted small">
              {texture.description}
            </MDBCardText>
            <div className="d-flex flex-wrap gap-2">
              {texture.materials.map((material, idx) => (
                <MDBBadge key={idx} color="secondary" className="py-1 px-2">
                  {material}
                </MDBBadge>
              ))}
            </div>
          </MDBCardBody>
        </div>
      </MDBCard>
    )
  }));

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

  return (
    <MDBRow className="p-4 mb-3">
      {/* Titolo e descrizione centrati */}
      <div className="text-center mb-2">
        <h2 className="fw-semibold mb-2">
          Seleziona il mix di materiali e finiture che più ti rispecchia
        </h2>
        <p className="text-muted">
          Esplora le nostre combinazioni di texture e materiali per creare l'atmosfera perfetta per il tuo stand
        </p>
      </div>

      {/* Griglia di card: su md 2 colonne, su lg 3 colonne, su xxl 4 colonne */}
      {/* <MDBRow className="g-4 mt-0">
        {textures.map((texture) => (
          <MDBCol key={texture.id} md="6" lg="4" xxl="3">
            <MDBCard className={"h-100 rounded hover-shadow " + (selectedTextures.includes(texture.id) && "shadow border border-primary border-2")}>
              <div
                className="position-relative cursor-pointer"
                onClick={() => toggleTexture(texture.id)}
              > */}
      {/* Immagine con aspect ratio 16:9 */}
      {/* <MDBCardImage
                  src={texture.imageUrl}
                  alt={texture.name}
                  className="w-100 rounded-top"
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                /> */}

      {/* Checkbox circolare in alto a destra se selezionata */}
      {/* {selectedTextures.includes(texture.id) && (
                  <span
                    className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle bg-primary"
                    style={{ width: '2rem', height: '2rem' }}
                  >
                    <i className="fas fa-check text-white"></i>
                  </span>
                )} */}

      {/* <MDBCardBody>
                  <MDBCardTitle>{texture.name}</MDBCardTitle>
                  <MDBCardText className="text-muted small">
                    {texture.description}
                  </MDBCardText>
                  <div className="d-flex flex-wrap gap-2">
                    {texture.materials.map((material, idx) => (
                      <MDBBadge key={idx} color="secondary" className="py-1 px-2">
                        {material}
                      </MDBBadge>
                    ))}
                  </div>
                </MDBCardBody> */}
      {/* </div>
            </MDBCard>
          </MDBCol>
        ))}
      </MDBRow> */}

      <GeneralForm<APItextureData, { project_uid: string }>
        mode="upsert"
        hideHeader
        createBtnProps={{
          label: "Salva Obbiettivi",
          labelSaving: "Salvataggio in corso",
        }}
        params={{ project_uid }}
        fields={[
          {
            name: "list_texture", label: "Seleziona Responsabile", required: true, grid: { md: 12 },
            type: "selectbox", customElementKey: "cards", options: objetivesOptions,
            properties: {
              multiple: true,
              showSummaryPills: true,
              hideChoseSomething: true,
              gridConfig: {
                md: 2,
                xl: 3,
                xxl: 4
              }
            },


          },
        ]}

        getData={getObjectiveData}
        createData={updateObjectiveData}
        updateData={updateObjectiveData}
      />

    </MDBRow>
  );
}
