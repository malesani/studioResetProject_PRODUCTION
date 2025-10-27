import { useState } from 'react';
import {
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn
} from 'mdb-react-ui-kit';

import { GeneralForm, SelectData } from '../../app_components/GeneralForm';
import { General_InfoBlock } from '../../app_components/General_InfoBlock';
import { APICustTeamMemberInfo } from "../../api_module/CustomerTeamMemberRequest";

interface ServiceCardProps {
  teamMembers: APICustTeamMemberInfo[];
  id: string;
  name: string;
  description: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function ServiceCard({
  name,
  description,
  isSelected,
  onToggle,
  teamMembers
}: ServiceCardProps) {
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = () => {
    // Open confirmation modal instead of toggling directly
    setShowModal(true);
  };

  const handleConfirm = () => {
    // Call the parent toggle
    onToggle();
    // Close modal
    setShowModal(false);
  };

  const handleCancel = () => {
    // Simply close modal without toggling
    setShowModal(false);
  };

  const teamMemberOptions: SelectData[] = teamMembers.map(member => ({
    value: member.teamMember_uid,
    text: `${member.first_name} ${member.last_name}`
  }));

  return (<>
    <MDBCard
      onClick={handleCardClick}
      className={`
          mb-3
          border
          ${isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light shadow-sm'}
        `}
      style={{ cursor: 'pointer', height: '125px' }}
    >
      <MDBCardBody className="d-flex flex-column justify-content-between align-items-start p-4">
        <div className="d-flex flex-row justify-content-between w-100">
          <h5 className="card-title mb-1">{name}</h5>
          {isSelected && <MDBIcon fas icon="check-circle" color='primary' className="fa-lg" />}
        </div>
        <div className="d-flex flex-row">
          <p className="text-muted mb-0">{description}</p>
        </div>
      </MDBCardBody>
    </MDBCard>

    <MDBModal open={showModal} tabIndex='-1'>
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>Conferma {isSelected ? 'Disattivazione' : 'Attivazione'}</MDBModalTitle>
            <MDBBtn className='btn-close' color='none' onClick={handleCancel}></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            {isSelected ? (
              <p>Sei sicuro di voler disattivare il servizio "{name}"?</p>
            ) : (
              <GeneralForm<APICustTeamMemberInfo, {}>
                mode="create"
                hideHeader
                createBtnProps={{
                  label: "Conferma Attivazine",
                  labelSaving: "Conferma in corso",
                }}
                fields={[
                  {
                    name: "teamMember_uid", label: "Seleziona Responsabile", required: true, grid: { md: 12 },
                    type: "selectbox", options: teamMemberOptions,
                    properties: {
                      search: true,
                      searchLabel: "Ricerca Responsabile...",
                      multiple: false,
                    },
                    extraElements: [{
                      position: "after",
                      grid: { md: 12 },
                      element:
                        <General_InfoBlock
                          blockMode='alert'
                          presetMode='suggestion'
                          title='Documenti necessari'
                          message='Il Responsabile dovrà caricare i seguenti documenti:'
                        >
                          <ul className="m-0">
                            <li className="text-sm text-green-700 flex items-start gap-2">
                              Richiesta autorizzazione fiera
                            </li>
                            <li className="text-sm text-green-700 flex items-start gap-2">
                              Compilazione moduli di registrazione
                            </li>
                            <li className="text-sm text-green-700 flex items-start gap-2">
                              Pagamento servizio
                            </li>
                            <li className="text-sm text-green-700 flex items-start gap-2">
                              Conferma attivazione servizio
                            </li>
                          </ul>
                        </General_InfoBlock>
                    }]
                  },
                ]}
                createData={async (payload) => {
                  console.log(payload);
                  return {
                    response: {
                      success: true,
                      message: "Attivazione avvenuta"
                    },
                    data: payload
                  };
                }}
                onSuccess={handleConfirm}
              />
            )}
          </MDBModalBody>
          {isSelected && (
            <MDBModalFooter>
              <MDBBtn color='secondary' onClick={handleCancel} outline>Annulla</MDBBtn>
              <MDBBtn color='primary' onClick={handleConfirm}>Conferma</MDBBtn>
            </MDBModalFooter>
          )}
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  </>);
}
