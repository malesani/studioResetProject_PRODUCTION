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

import { StandType } from './constants';

export interface StandTypeCardProps {
  standType: StandType;
  isSelected: boolean;
  onSelect: () => void;
}

export function StandTopView({ standType }: { standType: StandType }) {
  const getWallStyles = () => {
    switch (standType.value) {
      case 'isola':
        return { top: false, right: false, bottom: false, left: false };
      case 'angolo':
        return { top: true, right: false, bottom: false, left: true };
      case 'penisola':
        return { top: false, right: false, bottom: false, left: true };
      case 'lineare':
        return { top: true, right: true, bottom: false, left: true };
      default:
        return {};
    }
  };

  const walls = getWallStyles();

  return (
    <div
      className="position-relative border border-secondary"
      style={{
        borderStyle: 'dashed',
        width: '10rem',    // corrisponde a w-48 (12*4=48px in Tailwind)
        height: '10rem',
      }}
    >
      {walls.top && (
        <div
          className="position-absolute top-0 start-0 end-0"
          style={{ height: '0.5rem', backgroundColor: '#0d6efd' }}
        />
      )}
      {walls.right && (
        <div
          className="position-absolute top-0 end-0 bottom-0"
          style={{ width: '0.5rem', backgroundColor: '#0d6efd' }}
        />
      )}
      {walls.bottom && (
        <div
          className="position-absolute bottom-0 start-0 end-0"
          style={{ height: '0.5rem', backgroundColor: '#0d6efd' }}
        />
      )}
      {walls.left && (
        <div
          className="position-absolute top-0 start-0 bottom-0"
          style={{ width: '0.5rem', backgroundColor: '#0d6efd' }}
        />
      )}

      {/* Area interna */}
      <div
        className="position-absolute"
        style={{
          top: '0.5rem',
          bottom: '0.5rem',
          left: '0.5rem',
          right: '0.5rem',
          backgroundColor: '#cfe2ff',
        }}
      />
    </div>
  );
}

export function StandTypeCard({ standType, isSelected, onSelect }: StandTypeCardProps) {
  const isTablet = useIsMobile(992);
  const isMobile = useIsMobile(768);

  return (<>
    <MDBCard
      grid={{ md: 3 }}
      border={isSelected ? 'primary' : 'light'}
      className={`flex-fill`}
      style={isSelected ? { backgroundColor: '#dfe7f6' } : undefined}
    >
      <MDBCardBody
        className="d-flex flex-column justify-content-between align-items-center p-3"
        style={{ cursor: 'pointer' }}
        onClick={onSelect}
      >
        {/* Preview top view */}
        <div className="d-flex justify-content-center mb-4">
          <StandTopView standType={standType} />
        </div>

        {/* Titolo */}
        <h3 className="fs-5 fw-bold text-dark mb-2 text-center">
          {standType.name}
        </h3>

        {/* Descrizione */}
        <p className="text-muted small mb-4 text-center">
          {standType.description}
        </p>

        {/* Caratteristiche */}
        <div className="small text-muted w-100">
          <div className="d-flex justify-content-between mb-1">
            <span>Visibilità:</span>
            <span className="fw-medium">{standType.visibility}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Flusso visitatori:</span>
            <span className="fw-medium">{standType.traffic}</span>
          </div>
        </div>
      </MDBCardBody>
    </MDBCard >
  </>);
}