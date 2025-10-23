import { requestFunction, DataResponse, TableDataResponse } from '../../hooks/RequestFunction';
import { TableFilters } from '../../app_components/TableData/interfaces';

import { EstimateInfo, EstimateItem } from './interfaces';
export type { EstimateInfo, EstimateItem } from './interfaces';

// *** ESTIMATES INFO ***

/** GET singolo (by UID) */
export async function get_estimateByUid(
  { preventivo_uid }: { preventivo_uid: string }
): Promise<DataResponse<EstimateInfo>> {
  const response = await requestFunction(
    '/estimates/api/estimates.php',
    'GET',
    'estimate_info',
    { preventivo_uid }
  );
  return { response, data: response.data ? response.data : undefined };
}

/** GET lista completa (non paginata) */
export async function get_estimatesList<T>(
  filters: Partial<Record<'search' | 'stato' | 'tipo' | 'project_uid', string>>
    & Partial<Record<keyof T, string | number>>
): Promise<DataResponse<EstimateInfo>> {
  const response = await requestFunction(
    '/estimates/api/estimates.php',
    'GET',
    'estimates_list',
    { filters } // mantenuto come nel tuo esempio prodotti
  );

  if (response.success && response.data?.project_info) {
    // mantengo la stessa logica dell'esempio
    return { response, data: response.data.project_info };
  }
  return { response };
}

/** GET lista paginata */
export async function get_estimatesListPaginated(
  params: TableFilters<EstimateInfo> & {
    stato?: string;
    tipo?: string;
    project_uid?: string;
  }
): Promise<TableDataResponse<EstimateInfo>> {
  const response = await requestFunction(
    '/estimates/api/estimates.php',
    'GET',
    'estimates_list_paginated',
    params
  );

  // il backend risponde già nel formato TableDataResponse
  return response as TableDataResponse<EstimateInfo>;
}

/** POST create */
export async function create_estimate(
  estimate_info: EstimateInfo & { project_uid: string }
): Promise<DataResponse<EstimateInfo>> {
  const payload = estimate_info;
  const response = await requestFunction(
    '/estimates/api/estimates.php',
    'POST',
    'create_estimate',
    payload
  );
  return { response, data: response.data ? response.data : undefined };
}

/** PUT update */
export async function update_estimate(
  estimate_info: Partial<EstimateInfo> & { preventivo_uid: string }
): Promise<DataResponse<EstimateInfo>> {
  const response = await requestFunction(
    '/estimates/api/estimates.php',
    'PUT',
    'update_estimate',
    estimate_info
  );
  return { response, data: response.data ? response.data : undefined };
}

/** DELETE (opzionale ma utile dalla tabella) */
export async function delete_estimate(
  { preventivo_uid }: { preventivo_uid: string }
): Promise<DataResponse<null>> {
  const response = await requestFunction(
    '/estimates/api/estimates.php',
    'DELETE',
    'estimate_info',
    { preventivo_uid }
  );
  return { response, data: undefined };
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// *** ESTIMATE ITEMS ***
export async function get_estimateItemsList<T>(
  filters: Partial<Record<'search', string>> & Partial<Record<keyof T, string | number>> & { preventivo_uid: string }
): Promise<DataResponse<EstimateItem>> {
  const response = await requestFunction(
    '/estimates/api/estimateItems.php',
    'GET',
    'estimate_items_list',
    { filters }
  );

  if (response.success && response.data?.project_info) {
    return { response, data: response.data.project_info };
  }
  return { response };
}


export async function get_estimateItemsListPaginated(
  params: TableFilters<EstimateItem> & { preventivo_uid: string }
): Promise<TableDataResponse<EstimateItem>> {
  const response = await requestFunction(
    '/estimates/api/estimateItems.php',
    'GET',
    'estimate_items_list_paginated',
    params
  );

  return response as TableDataResponse<EstimateItem>;
}


/** BULK delete+insert */
type SafeItemInput =
  Pick<EstimateItem, 'art_code' | 'name'> &
  Partial<EstimateItem>;

export async function bulk_replace_estimate_items(
  preventivo_uid: string,
  items: SafeItemInput[],
  opts?: { dryRun?: boolean }
): Promise<DataResponse<{ inserted_rows: number }>> {

  // Sanitize runtime: rimuovi campi vietati ed i valori undefined
  const forbidden = new Set(['item_id', 'company_uid', 'preventivo_uid', 'created_at', 'updated_at']);
  const sanitized = items.map((it) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(it as Record<string, unknown>)) {
      if (forbidden.has(k)) continue;
      if (typeof v === 'undefined') continue;
      out[k] = v;
    }
    return out;
  });

  const payload: Record<string, unknown> = {
    preventivo_uid,          // passato solo top-level
    items: sanitized,
  };
  if (typeof opts?.dryRun !== 'undefined') payload.dry_run = !!opts.dryRun;

  const response = await requestFunction(
    '/estimates/api/estimateItems.php',
    'POST',
    'bulk_replace_estimate_items',
    payload
  );

  return { response, data: response.data ? response.data : undefined };
}