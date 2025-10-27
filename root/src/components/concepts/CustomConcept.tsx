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

type CustomConceptInfo = {
  title: string;
  message: string;
};


export function CustomConcept() {
  const [createdConcepts, setCreatedConcepts] = useState<CustomConceptInfo[]>([]);

  async function createCustomConceptInfo(payload: CustomConceptInfo) {
    // aggiungo al mio state locale
    setCreatedConcepts(prev => [...prev, payload]);
    // simulo risposta positiva
    return {
      data: payload,
      response: { success: true, message: 'Concept creato con successo!' }
    };
  }

  return (<>
    {createdConcepts.length > 0 && (
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
              {createdConcepts.map((obj, idx) => (
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
                        setCreatedConcepts((prev) =>
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
      title='Definisci il Tuo Concept'
      message="Hai un'idea creativa unica per il tuo stand? Descrivi qui il tuo concept personalizzato. Un concept ben definito aiuta a creare un'esperienza memorabile e coerente con i tuoi obiettivi."
    />

    <GeneralForm<CustomConceptInfo>
      mode="create"
      title="Crea il tuo Obbiettivo"
      icon="plus"
      className="pt-3"
      hideHeader={true}
      fields={[
        { name: "title", label: "Titolo", required: true, type: "text", grid: { md: 12 } },
        { name: "message", label: "Descrizione", required: true, type: "text_area", grid: { md: 12 } }
      ]}
      createData={createCustomConceptInfo}
      onSuccess={(created) => {
        console.log('Creato:', created);
      }}
    />
  </>);
}