import React, { useState } from 'react';
import {
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCardFooter,
  MDBIcon,
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBListGroup,
  MDBListGroupItem,
  MDBBadge,
  MDBPopover,
  MDBPopoverHeader,
  MDBPopoverBody,
  MDBCollapse,
} from 'mdb-react-ui-kit';
import { useIsMobile } from "../../app_components/ResponsiveModule";

import { Objective } from './objectives';

export interface ObjectiveCardProps {
  objective: Objective;
  isSelected: boolean;
  onSelect: () => void;
}

export function ObjectiveCard({ objective, isSelected, onSelect }: ObjectiveCardProps) {
  const isTablet = useIsMobile(992);
  const isMobile = useIsMobile(768);

  const [showDetails, setShowDetails] = useState(false);

  const complexityLabels = {
    low: { text: 'BASSA', color: 'success', icon: 'exclamation' },
    medium: { text: 'MEDIA', color: 'warning', icon: 'exclamation-circle' },
    high: { text: 'ALTA', color: 'danger', icon: 'exclamation-triangle' }
  } as const;

  const impactLabels = {
    low: { text: 'BASSO', color: 'light', icon: 'mug-hot' },
    medium: { text: 'MEDIO', color: 'primary', icon: 'zap' },
    high: { text: 'MOLTO ALTO', color: 'danger', icon: 'fire' }
  } as const;

  const comp = complexityLabels[objective.complexity];
  const imp = impactLabels[objective.impact];

  if (!isMobile) {
    const [open, setOpen] = useState(false);

    return (<>
      <MDBCard
        border={isSelected ? 'primary' : 'light'}
        className={`flex-fill`}
        style={isSelected ? { backgroundColor: '#dfe7f6' } : undefined}
      >
        <MDBCardBody
          className="d-flex justify-content-between align-items-center p-3"
          style={{ cursor: 'pointer' }}
          onClick={onSelect}
        >
          <div className="d-flex flex-row align-items-center"><MDBIcon icon={objective.icon} size="xl" className="me-3"></MDBIcon><h6 className="mb-0">{objective.title}</h6></div>
          <div className="d-flex flex-column gap-2">
            <MDBBtn type="button" className='bg-light ms-2' color='secondary' outline floating
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();      // ← ferma il bubbling al CardBody
                setOpen(o => !o);
              }}
            >
              <MDBIcon icon="info" />
            </MDBBtn>
          </div>

        </MDBCardBody>
      </MDBCard >

      <MDBModal open={open} onClose={() => setOpen(false)} tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>
                <div className="d-flex flex-row align-items-center">
                  <MDBIcon icon={objective.icon} size="xl" className='me-3'></MDBIcon>
                  <h5 className="mb-0">{objective.title}</h5>
                </div>
              </MDBModalTitle>
              <MDBBtn type="button" className='btn-close' color='none' onClick={() => setOpen(!open)}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <p className="mb-0 text-muted">{objective.description}</p>

              <MDBRow className="mt-2 gx-2 align-items-center">
                {/* Complessità */}
                <MDBCol size="6" className="d-flex flex-row flex-wrap justify-content-start  gap-1">
                  <small className="text-muted">Complessità:</small>
                  <MDBBadge pill color={comp.color} light className="d-flex align-items-center">
                    <MDBIcon fas icon={comp.icon} className='me-2' />
                    {comp.text}
                  </MDBBadge>
                </MDBCol>

                {/* Impatto */}
                <MDBCol size="6" className="d-flex flex-row flex-wrap justify-content-end align-items-end gap-1">
                  <small className="text-muted">Impatto:</small>
                  <MDBBadge pill color={imp.color} className=" ">
                    <MDBIcon fas icon={imp.icon} className='me-2' />
                    {imp.text}
                  </MDBBadge>
                </MDBCol>
              </MDBRow>
            </MDBModalBody>

            <MDBModalFooter className='d-flex flex-column align-items-start'>
              {/* heading dei suggerimenti */}
              <h6 className="fw-semibold m-2">Suggerimenti</h6>
              <MDBListGroup flush className="list-group-transparent">
                {objective.suggestions.map((sug, idx) => (
                  <MDBListGroupItem
                    key={idx}
                    className="d-flex align-items-start gap-2 p-2 py-1 border-0"
                  >
                    <span><MDBIcon
                      fas
                      icon="dot-circle"
                      className="text-black-50 mt-1"
                      size="xs"
                    /></span>
                    <span className="small">{sug}</span>
                  </MDBListGroupItem>
                ))}
              </MDBListGroup>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>);
  } else {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (<>
      <MDBCard
        border={isSelected ? 'primary' : 'light'}
        className={`flex-fill`}
      >
          <MDBCardBody
            className={`d-flex justify-content-between align-items-center p-3 ${isOpen ? "rounded-top-3 border-bottom" : "rounded-3"}`}
            style={isSelected ? { backgroundColor: '#dfe7f6', cursor: 'pointer' } : { cursor: 'pointer' }}
            onClick={onSelect}
          >
            <div className="d-flex flex-row align-items-center"><MDBIcon icon={objective.icon} size="xl" className="me-3"></MDBIcon><h6 className="mb-0">{objective.title}</h6></div>
            <div className="d-flex flex-column gap-2">
              <MDBBtn type="button" className='bg-light ms-2' color='secondary' outline floating
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();      // ← ferma il bubbling al CardBody
                  toggleOpen();
                }}
              >
                <MDBIcon icon={isOpen ? "minus" : "plus"} />
              </MDBBtn>
            </div>

          </MDBCardBody>
               

        

          <MDBCardBody className="rounded-4 p-0">
            <MDBCollapse className="p-3" open={isOpen}>
              <p className="mb-0 text-muted">{objective.description}</p>

              <hr className="my-3" />

              <MDBRow className="mt-2 gx-2 align-items-center">
                {/* Complessità */}
                <MDBCol size="6" className="d-flex flex-row flex-wrap justify-content-start  gap-1">
                  <small className="text-muted">Complessità:</small>
                  <MDBBadge pill color={comp.color} light className="d-flex align-items-center">
                    <MDBIcon fas icon={comp.icon} className='me-2' />
                    {comp.text}
                  </MDBBadge>
                </MDBCol>

                {/* Impatto */}
                <MDBCol size="6" className="d-flex flex-row flex-wrap justify-content-end align-items-end gap-1">
                  <small className="text-muted">Impatto:</small>
                  <MDBBadge pill color={imp.color} className=" ">
                    <MDBIcon fas icon={imp.icon} className='me-2' />
                    {imp.text}
                  </MDBBadge>
                </MDBCol>
              </MDBRow>

              <hr className="my-3" />

              <h6 className="fw-semibold m-2">Suggerimenti</h6>
              <MDBListGroup flush className="list-group-transparent">
                {objective.suggestions.map((sug, idx) => (
                  <MDBListGroupItem
                    key={idx}
                    className="d-flex align-items-start gap-2 p-2 py-1 border-0"
                  >
                    <span><MDBIcon
                      fas
                      icon="dot-circle"
                      className="text-black-50 mt-1"
                      size="xs"
                    /></span>
                    <span className="small">{sug}</span>
                  </MDBListGroupItem>
                ))}
              </MDBListGroup>
            </MDBCollapse>
          </MDBCardBody>
        
      </MDBCard >
    </>);

  }


  return (<>
    <MDBCard
      border={isSelected ? 'primary' : 'light'}
      className={`flex-fill`}
      style={isSelected ? { backgroundColor: '#dfe7f6' } : undefined}
    >
      <MDBCardBody
        className="d-flex justify-content-between align-items-center p-3"
        style={{ cursor: 'pointer' }}
        onClick={onSelect}
      >
        <div className="d-flex flex-row align-items-center"><MDBIcon icon={objective.icon} size="xl" className="me-3"></MDBIcon><h6 className="mb-0">{objective.title}</h6></div>
        <div className="d-flex flex-column gap-2">
          <MDBPopover
            color='secondary' dismiss
            btnClassName="btn-outline-secondary btn-floating bg-light ms-2"
            btnChildren={<MDBIcon icon="info" />}
          >
            <MDBPopoverHeader className="d-flex justify-content-between align-items-center">
              <div className="d-flex flex-row align-items-center"><MDBIcon icon={objective.icon} size="xl" className="me-2"></MDBIcon><h5 className="mb-0">{objective.title}</h5></div>
              {isSelected && <MDBIcon fas icon="check-circle" size="lg" className="text-primary me-3" />}
            </MDBPopoverHeader>
            <MDBPopoverBody>
              <p className="mb-0 text-muted">{objective.description}</p>

              <MDBRow className="mt-2 gx-2 align-items-center">
                {/* Complessità */}
                <MDBCol size="6" className="d-flex flex-row flex-wrap justify-content-start  gap-1">
                  <small className="text-muted">Complessità:</small>
                  <MDBBadge pill color={comp.color} light className="d-flex align-items-center">
                    <MDBIcon fas icon={comp.icon} className='me-2' />
                    {comp.text}
                  </MDBBadge>
                </MDBCol>

                {/* Impatto */}
                <MDBCol size="6" className="d-flex flex-row flex-wrap justify-content-end align-items-end gap-1">
                  <small className="text-muted">Impatto:</small>
                  <MDBBadge pill color={imp.color} className=" ">
                    <MDBIcon fas icon={imp.icon} className='me-2' />
                    {imp.text}
                  </MDBBadge>
                </MDBCol>
              </MDBRow>
              <hr className="my-3" />

              {/* heading dei suggerimenti */}
              <h6 className="fw-semibold mb-2">Suggerimenti</h6>

              <MDBListGroup flush className="list-group-transparent">
                {objective.suggestions.map((sug, idx) => (
                  <MDBListGroupItem
                    key={idx}
                    className="d-flex align-items-start gap-2 p-0 py-1 border-0"
                  >
                    <span><MDBIcon
                      fas
                      icon="dot-circle"
                      className="text-black-50 mt-1"
                      size="xs"
                    /></span>
                    <span className="small">{sug}</span>
                  </MDBListGroupItem>
                ))}
              </MDBListGroup>
            </MDBPopoverBody>

          </MDBPopover>
        </div>

      </MDBCardBody>
    </MDBCard >
  </>);
}
