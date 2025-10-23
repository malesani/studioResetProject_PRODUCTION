import { useState, useEffect } from 'react';
import {
  MDBBtn,
  MDBIcon
} from 'mdb-react-ui-kit';
import { useFormAlert } from '../../app_components/GeneralAlert';

import { useIsMobile } from "../../app_components/ResponsiveModule";

export type CustomColorsProps = {
  customColors: string[];
  addColor: (hex: string) => void;
  removeColor: (index: number) => void;
  maxColors?: number;
};

export function CustomColors({
  customColors,
  addColor,
  removeColor,
  maxColors = 5,
}: CustomColorsProps) {
  // const isTablet = useIsMobile(992);
  const isMobile = useIsMobile(768);

  const { showAlertInfo, FormAlert } = useFormAlert();

  // Mostra l’alert una volta al mount (dipendenze corrette)
  useEffect(() => {
    showAlertInfo(
      `Seleziona i colori che meglio rappresentano il tuo brand e il tuo stile. ` +
      `Puoi aggiungere fino a ${maxColors} colori per creare la tua palette personalizzata.`
    );
  }, []);

  const [newColor, setNewColor] = useState<string>('#000000');

  const handleAddColor = () => {
    if (
      newColor &&
      customColors.length < maxColors &&
      !customColors.includes(newColor)
    ) {
      addColor(newColor);
      setNewColor('#000000');
    }
  };

  return (
    <>
      <FormAlert />

      {/* Picker + Bottone */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="d-flex flex-row flex-nowrap gap-3 ">
          <div 
          className="border border-1 rounded-circle m-0 p-1"
          style={{ borderColor: '#F5F5F5' }}
          >
            <input
              type="color"
              id="colorInput"
              className="form-control form-control-color border-0 rounded-circle p-0"
              style={{ height: '2.5rem', width: '2.5rem' }}
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              title="Choose your color"
            />
          </div>

          <MDBBtn
            color="primary"
            rounded
            className="text-nowrap"
            disabled={customColors.length >= maxColors}
            onClick={handleAddColor}
          >
            <i className="fas fa-plus me-2 text-nowrap"></i>{!isMobile && 'Aggiungi colore | '}{customColors.length}/{maxColors}
          </MDBBtn>

        </div>
      </div>

      {/* Anteprima swatches */}
      {customColors.length > 0 && (
        <div className="d-flex overflow-hidden rounded mb-3" style={{ height: '6rem' }}>
          {customColors.map((color, idx) => (
            <div
              key={idx}
              className="position-relative flex-fill"
              style={{ backgroundColor: color }}
            >
              {/* Pulsante rimuovi */}
              <MDBBtn
                size="sm"
                color="light"
                floating
                className="position-absolute top-0 end-0 m-1"
                onClick={() => removeColor(idx)}
              >
                <MDBIcon icon="times" />
              </MDBBtn>

              {/* Codice hex in overlay */}
              <div className="position-absolute bottom-0 start-0 w-100 text-truncate text-center bg-white bg-opacity-75">
                <small className="d-block text-muted m-0 p-1">{color}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}