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

type CustomObjectiveInfo = {
  title: string;
  message: string;
};


export function CustomObjective() {
  const [createdObjectives, setCreatedObjectives] = useState<CustomObjectiveInfo[]>([]);

  async function createCustomObjectiveInfo(payload: CustomObjectiveInfo) {
    // aggiungo al mio state locale
    setCreatedObjectives(prev => [...prev, payload]);
    // simulo risposta positiva
    return {
      data: payload,
      response: { success: true, message: 'Obiettivo creato con successo!' }
    };
  }

  return (<>
    {createdObjectives.length > 0 && (
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
              {createdObjectives.map((obj, idx) => (
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
                        setCreatedObjectives((prev) =>
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

    <GeneralForm<CustomObjectiveInfo>
      mode="create"
      title="Crea il tuo Obbiettivo"
      icon="plus"
      className="pt-3"
      hideHeader={true}
      fields={[
        {
          name: "title", label: "Titolo", required: true, type: "text", grid: { md: 12 },
          extraElements: [{
            position: "before",
            grid: { md: 12 },
            element:
              <General_InfoBlock
                presetMode='info'
                icon=''
                className='mb-0'
                title='Definisci il Tuo Obiettivo'
                message='Hai un obiettivo specifico che non trovi tra quelli predefiniti? 
                Descrivilo qui sotto in modo chiaro e dettagliato. Un obiettivo ben definito 
                è il primo passo per il successo del tuo evento.'
              />
          }]
        },
        {
          name: "message", label: "Descrizione", required: true, type: "text_area", grid: { md: 12 },
          extraElements: [{
            position: "after",
            grid: { md: 12 },
            element:
              <General_InfoBlock
                presetMode='suggestion'
                title="Suggerimenti per massimizzare l' impatto:"
                className="mb-0"
              >
                <ul className="m-0">
                  <li className="text-sm text-green-700 flex items-start gap-2">
                    Definisci metriche specifiche per misurare il successo
                  </li>
                  <li className="text-sm text-green-700 flex items-start gap-2">
                    Identifica il pubblico target principale
                  </li>
                  <li className="text-sm text-green-700 flex items-start gap-2">
                    Stabilisci una timeline chiara per il raggiungimento
                  </li>
                  <li className="text-sm text-green-700 flex items-start gap-2">
                    Considera possibili ostacoli e soluzioni
                  </li>
                  <li className="text-sm text-green-700 flex items-start gap-2">
                    Allinea l'obiettivo con la strategia aziendale generale
                  </li>
                </ul>
              </General_InfoBlock>
          }]
        }
      ]}
      createData={createCustomObjectiveInfo}
      onSuccess={(created) => {
        console.log('Creato:', created);
      }}
    />
  </>);
}