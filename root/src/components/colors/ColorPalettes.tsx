import React from 'react';
import {
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn
} from 'mdb-react-ui-kit';
import { useIsMobile } from "../../app_components/ResponsiveModule";

import { predefinedColors } from './colors';

export type ColorPalettesProps = {
  selectedPalettes: string[];
  togglePalette: (id: string) => void;
  clearSelection: () => void;
};

export function ColorPalettes({
  selectedPalettes,
  togglePalette,
  clearSelection,
}: ColorPalettesProps) {
  const isTablet = useIsMobile(992);
  const isMobile = useIsMobile(768);

  // Altezza dell’anteprima colore: più bassa su mobile
  const previewHeight = isMobile ? '4rem' : '6rem';

  return (
    <div className="container py-4">
      {/* Pulsante “Deseleziona tutto” */}
      <div className="d-flex justify-content-end mb-3">
        <MDBBtn rounded size="sm" color="secondary" onClick={clearSelection}>
          <i className="fas fa-trash-alt me-2"></i>
          <span>Rimuovi tutto</span>
        </MDBBtn>
      </div>

      {/* Griglia responsive:
          - 1 colonna su xs
          - 2 colonne su md (>= 768px)
          - 3 colonne su lg (>= 992px)
          - 4 colonne su xl (>= 1200px)
      */}
      <MDBRow className="g-4">
        {predefinedColors.map((palette) => {
          const isSelected = selectedPalettes.includes(palette.id);

          return (
            <MDBCol key={palette.id} sm="12" md="6" lg="6" xl="4">
              <MDBCard
                onClick={() => togglePalette(palette.id)}
                className={`h-100 position-relative border ${
                  isSelected
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-secondary'
                } hover-shadow`}
                style={{ cursor: 'pointer' }}
              >
                {/* Cerchio di selezione in alto a destra */}
                {isSelected && (
                  <span
                    className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle bg-primary"
                    style={{ width: '2rem', height: '2rem' }}
                  >
                    <i className="fas fa-check text-white"></i>
                  </span>
                )}

                <MDBCardBody className="d-flex flex-column">
                  {/* Titolo */}
                  <MDBCardTitle className="h6 mb-1">{palette.title}</MDBCardTitle>

                  {/* Descrizione */}
                  <MDBCardText className="text-muted small mb-3">
                    {palette.description}
                  </MDBCardText>

                  {/* Anteprima dei colori */}
                  <div
                    className="d-flex overflow-hidden rounded mb-3"
                    style={{ height: previewHeight }}
                  >
                    {palette.suggestions.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex-fill"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Etichette testuali dei colori */}
                  <div className="mt-auto d-flex flex-wrap gap-2">
                    {palette.suggestions.map((color, idx) => (
                      <small key={idx} className="text-muted">
                        {color}
                      </small>
                    ))}
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          );
        })}
      </MDBRow>
    </div>
  );
}
