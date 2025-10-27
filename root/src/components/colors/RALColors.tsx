import React, { useState } from 'react';
import {
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBInput
} from 'mdb-react-ui-kit';
import { useIsMobile } from "../../app_components/ResponsiveModule";

import { ralColors, ralSeriesGroups } from './ral';

export type RALColorsProps = {
  selectedRAL: string[];
  toggleRAL: (id: string) => void;
};

export function RALColors({ selectedRAL, toggleRAL }: RALColorsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const isTablet = useIsMobile(992);
  const isMobile = useIsMobile(768);

  // Altezza preview colore (più bassa su mobile)
  const previewHeight = isMobile ? '4rem' : '6rem';

  // Filtra i colori in base alla ricerca
  const filteredColors = searchTerm
    ? ralColors.filter(
      color =>
        color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // Funzione di rendering di una singola card RAL
  function renderColorCard(color: typeof ralColors[0]) {
    const isSelected = selectedRAL.includes(color.id);
    return (
      <MDBCard
        key={color.id}
        onClick={() => toggleRAL(color.id)}
        className={`h-100 position-relative border ${isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
          } hover-shadow`}
        style={{ cursor: 'pointer' }}
      >
        {/* Marker di selezione in alto a destra */}
        {isSelected && (
          <span
            className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle bg-primary"
            style={{ width: '2rem', height: '2rem' }}
          >
            <i className="fas fa-check text-white"></i>
          </span>
        )}

        <MDBCardBody className="d-flex flex-column">
          {/* Titolo (nome + codice) */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <MDBCardTitle className="h6 m-0">{color.name}</MDBCardTitle>
            <span className="text-muted small font-monospace">{color.code}</span>
          </div>

          {/* Preview colore */}
          <div
            className="d-flex overflow-hidden rounded mb-3"
            style={{ height: previewHeight }}
          >
            <div className="flex-fill" style={{ backgroundColor: color.hex }} />
          </div>

          {/* Codice HEX */}
          <MDBCardText className="text-muted small mt-auto">
            {color.hex}
          </MDBCardText>
        </MDBCardBody>
      </MDBCard>
    );
  }

  return (
    <div className="container py-4">
      {/* Barra di ricerca */}

      <MDBInput
        className="form-control mb-3"
        label="Cerca per nome o codice RAL..."
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {/* Se non c'è ricerca, mostra raggruppamento per serie */}
      {!searchTerm && (
        <div className="space-y-5">
          {Object.entries(ralSeriesGroups).map(([series, colors]) => (
            <div key={series} className="mb-5">
              <h5 className="mb-3">Serie {series}</h5>
              <MDBRow className="g-4">
                {colors.map(color => (
                  <MDBCol key={color.id} sm="12" md="6" lg="4" xl="3">
                    {renderColorCard(color)}
                  </MDBCol>
                ))}
              </MDBRow>
            </div>
          ))}
        </div>
      )}

      {/* Se c'è ricerca, mostra i risultati filtrati */}
      {searchTerm && (
        <MDBRow className="g-4">
          {filteredColors.map(color => (
            <MDBCol key={color.id} sm="12" md="6" lg="4" xl="3">
              {renderColorCard(color)}
            </MDBCol>
          ))}
          {filteredColors.length === 0 && (
            <div className="col-12 text-center text-muted mt-4">
              Nessun colore trovato
            </div>
          )}
        </MDBRow>
      )}
    </div>
  );
}
