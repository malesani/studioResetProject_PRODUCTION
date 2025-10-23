import { requestFunction, requestResponse, DataResponse } from '../../hooks/RequestFunction';
import { FieldConfig } from '../GeneralForm';
import { MDBIcon } from 'mdb-react-ui-kit';

// ===== TIPI =====
export type ImportForm = {
  file: File[];           // GeneralForm file_upload passa un array di File
  delimiter: string;      // ';' | ',' | '\t' | 'auto'
  has_header: boolean;
  encoding: string;       // 'UTF-8' | 'ISO-8859-1'...
  dry_run?: boolean;      // default: true (solo anteprima)
};

export type UploadResp = {
  job_id: string;
  headers: string[];
  mapping: Record<string, string | null>;
  preview: string[][];
};

export type RunReport = {
  rows_total: number;
  rows_invalid: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; art_code?: string | null; errors: string[] }>;
};

export type RunResp = {
  job_id: string;
  report: RunReport;
};

// Campi per GeneralForm
export const Import_FormFields: FieldConfig<ImportForm>[] = [
    {
        name: 'file',
        label: 'File CSV',
        type: 'file_upload',
        required: true,
        grid: { md: 12 },
        properties: { accept: '.csv,.txt', maxFiles: 1 },
        validationFeedback: { invalid: 'Carica un file CSV.' },
        extraElements: [
            {
                position: 'before',
                grid: { md: 12 },
                element:
                    <div className="d-flex align-items-center mb-1" >
                        <MDBIcon fas icon="file-" className="me-2" />
                        <h5 className="fs-6 fw-semibold mb-0"> Import CSV Prodotti</h5>
                    </div>

            }
        ],
    },
    {
        name: 'delimiter',
        label: 'Separatore',
        type: 'selectbox',
        grid: { md: 4 },
        options: [
            { text: 'Punto e virgola (;)', value: ';' },
            { text: 'Virgola (,)', value: ',' },
            { text: 'Tab (\\t)', value: '\t' },
        ],
        properties: { hideChoseSomething: true },
        validationFeedback: { invalid: 'Seleziona il separatore' },
        required: true,
    },
    {
        name: 'has_header',
        label: 'Riga intestazione presente',
        type: 'checkbox',
        grid: { md: 4 },
        required: false,
    },
    {
        name: 'encoding',
        label: 'Encoding',
        type: 'selectbox',
        grid: { md: 4 },
        options: [
            { text: 'UTF-8', value: 'UTF-8', defaultSelected: true },
            { text: 'ISO-8859-1', value: 'ISO-8859-1' },
        ],
        properties: { hideChoseSomething: true },
        required: true,
    },
    {
        name: 'dry_run',
        label: 'Esegui Dry-Run (simulazione)',
        type: 'checkbox',
        grid: { md: 12 },
    },
];
// ===== API =====

// 1) Upload (CSV/XLSX) + dry-run immediato lato server (noi chiediamo comunque "run" esplicito dopo l'upload)
export async function upload_import(payload: ImportForm): Promise<DataResponse<UploadResp>> {
  const file = Array.isArray(payload.file) ? payload.file[0] : undefined;
  if (!file) {
    const response: requestResponse = { success: false, message: 'Seleziona un file', error: 'missing file' };
    return { response };
  }

  const fd = new FormData();
  fd.append('opt', 'upload_csv');
  fd.append('file', file);
  fd.append('delimiter', payload.delimiter || 'auto');
  fd.append('has_header', payload.has_header ? '1' : '0');
  fd.append('encoding', payload.encoding || 'UTF-8');

  const res = await fetch('/imports/api/products_import.php', { method: 'POST', body: fd });
  const json = (await res.json()) as requestResponse & { data?: UploadResp };

  // adatta a DataResponse
  return { response: json, data: json.data };
}

// 2) Run (dry-run o commit)
export async function run_import(args: {
  job_id: string;
  mapping?: Record<string, string | null>;
  delimiter?: string;
  has_header?: boolean;
  encoding?: string;
  dry_run: boolean;
}): Promise<DataResponse<RunResp>> {
  const body = {
    opt: 'run',
    job_id: args.job_id,
    dry_run: args.dry_run,
    // opzionali (il backend usa quelli salvati a job se non vengono passati)
    mapping: args.mapping ?? undefined,
    delimiter: args.delimiter,
    has_header: typeof args.has_header === 'boolean' ? args.has_header : undefined,
    encoding: args.encoding,
  };

  const response = await requestFunction('/imports/api/products_import.php', 'POST', 'run', body);
  return { response, data: response.data as RunResp | undefined };
}
