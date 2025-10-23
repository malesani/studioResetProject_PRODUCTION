import React from 'react';
import { MDBBadge, MDBBtn, MDBIcon, MDBTable, MDBTableBody, MDBTableHead } from 'mdb-react-ui-kit';
import type { RunReport } from './ImportsRequest';

type Props = {
  report: RunReport;
  onConfirm?: () => void; // chiamato per avviare commit
  onClose?: () => void;   // chiudi modale
  confirming?: boolean;
};

const DryRunReport: React.FC<Props> = ({ report, onConfirm, onClose, confirming }) => {
  const hasErrors = (report.errors?.length ?? 0) > 0;

  return (
    <div className="d-flex flex-column gap-3">
      {/* KPI */}
      <div className="d-flex flex-wrap gap-3">
        <Stat label="Righe totali" value={report.rows_total} icon="list-ol" color="primary" />
        <Stat label="Inserimenti" value={report.inserted} icon="plus" color="success" />
        <Stat label="Aggiornamenti" value={report.updated} icon="sync" color="info" />
        <Stat label="Saltate" value={report.skipped} icon="minus" color="secondary" />
        <Stat label="Non valide" value={report.rows_invalid} icon="exclamation-triangle" color={hasErrors ? 'danger' : 'secondary'} />
      </div>

      {/* Errors table */}
      {hasErrors && (
        <div className="border rounded-3 p-3">
          <div className="d-flex align-items-center mb-2">
            <MDBIcon fas icon="bug" className="me-2 text-danger" />
            <strong>Errori</strong>
            <span className="text-muted ms-2 small">({report.errors.length})</span>
          </div>

          <MDBTable hover responsive small>
            <MDBTableHead light>
              <tr>
                <th># Riga</th>
                <th>Codice</th>
                <th>Dettagli</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {report.errors.map((e, idx) => (
                <tr key={idx}>
                  <td>{e.row}</td>
                  <td>{e.art_code || <span className="text-muted">—</span>}</td>
                  <td>
                    {e.errors && e.errors.length
                      ? e.errors.join('; ')
                      : <span className="text-muted">—</span>}
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </div>
      )}

      {/* Actions */}
      <div className="d-flex justify-content-between mt-2">
        <MDBBtn color="light" onClick={onClose}>
          <MDBIcon fas icon="times" className="me-2" />
          Chiudi
        </MDBBtn>

        <MDBBtn color="success" onClick={onConfirm} disabled={confirming}>
          {confirming
            ? (<><MDBIcon fas icon="spinner" spin className="me-2" />Sincronizzazione…</>)
            : (<><MDBIcon fas icon="check" className="me-2" />Conferma & Sincronizza</>)}
        </MDBBtn>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number; icon: string; color: string; }> = ({ label, value, icon, color }) => (
  <div className="d-flex align-items-center border rounded-3 px-3 py-2">
    <div className="rounded-2 d-flex justify-content-center align-items-center me-3"
         style={{ width: 38, height: 38, backgroundColor: '#f7f7f7' }}>
      <MDBIcon fas icon={icon as any} className={`text-${color}`} />
    </div>
    <div>
      <div className={`text-${color} fw-semibold`}>{label}</div>
      <div className="fw-bold">{value}</div>
    </div>
  </div>
);

export default DryRunReport;
