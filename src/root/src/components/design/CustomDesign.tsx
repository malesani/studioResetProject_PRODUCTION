import { useState } from 'react';
import {
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBIcon,
} from 'mdb-react-ui-kit';

import { GeneralForm } from "../../app_components/GeneralForm";
import { General_InfoBlock } from '../../app_components/General_InfoBlock'

type CustomDesignInfo = {
  title: string;
  message: string;
};


export function CustomDesign() {
  const [createdDesigns, setCreatedDesigns] = useState<CustomDesignInfo[]>([]);

  async function createCustomDesignInfo(payload: CustomDesignInfo) {
    // aggiungo al mio state locale
    setCreatedDesigns(prev => [...prev, payload]);
    // simulo risposta positiva
    return {
      data: payload,
      response: { success: true, message: 'Design creato con successo!' }
    };
  }

  return (<>
    {createdDesigns.length > 0 && (
      <MDBCard className="mb-3">
        <MDBCardHeader>
          <h5 className="mb-0">Obiettivi creati</h5>
        </MDBCardHeader>
        <MDBCardBody className="p-0 mb-0">
          <MDBTable hover responsive className="mb-0">
            <MDBTableHead>
              <tr>
                <th>Titolo</th>
                <th>Descrizione</th>
                <th className="text-end"></th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {createdDesigns.map((obj, idx) => (
                <tr key={idx}>
                  <td>{obj.title}</td>
                  <td>{obj.message}</td>
                  <td className="text-end">
                    {/* Bottone “floating” in alto a destra della cella */}
                    <MDBBtn
                      color="light"
                      floating
                      size="sm"
                      onClick={() =>
                        setCreatedDesigns((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <MDBIcon fas icon="times" />
                    </MDBBtn>
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </MDBCardBody>
      </MDBCard>
    )}


    <General_InfoBlock
      presetMode='info'
      icon=''
      className="mb-0"
      title='Definisci il Tuo Design'
      message="Hai un'idea specifica per il design del tuo stand? Descrivi qui la tua visione. Un design ben definito aiuta a creare uno spazio che riflette perfettamente l'identità del tuo brand."
    />

    <GeneralForm<CustomDesignInfo>
      mode="create"
      title="Crea il tuo Obbiettivo"
      icon="plus"
      className="pt-3"
      hideHeader={true}
      fields={[
        { name: "title", label: "Titolo", required: true, type: "text", grid: { md: 12 } },
        { name: "message", label: "Descrizione", required: true, type: "text_area", grid: { md: 12 } }
      ]}
      createData={createCustomDesignInfo}
      onSuccess={(created) => {
        console.log('Creato:', created);
      }}
    />
  </>);
}