import { requestFunction, DataResponse, TableDataResponse } from '../../hooks/RequestFunction';
import { TableFilters } from '../../app_components/TableData/interfaces';

import { APIFair } from './interfaces';
export type { APIFair } from './interfaces';

/** GET singolo (by fair_uid) */
export async function get_fairByUid(
  { fair_uid }: { fair_uid: string }
): Promise<DataResponse<APIFair>> {
  const response = await requestFunction(
    '/fairs/api/fairs.php',
    'GET',
    'fair_info',
    { fair_uid }
  );
  return { response, data: response.data ? response.data as APIFair : undefined };
}

/** GET lista completa (non paginata) */
export async function get_fairsList<T>(
  filters: Partial<Record<'search' | 'sector' | 'start_from' | 'start_to' | 'end_from' | 'end_to', string>>
    & Partial<Record<'active', 0 | 1 | boolean>>
    & Partial<Record<keyof T, string | number>>
): Promise<DataResponse<APIFair>> {
  const response = await requestFunction(
    '/fairs/api/fairs.php',
    'GET',
    'fairs_list',
    { ...filters }
  );

  // l’API ritorna data = array di fiere
  return { response };
}

/** GET lista paginata */
export async function get_fairsListPaginated(
  params: TableFilters<APIFair> & {
    sector?: string;
    active?: 0 | 1 | boolean;
    start_from?: string; // YYYY-MM-DD
    start_to?: string;   // YYYY-MM-DD
    end_from?: string;   // YYYY-MM-DD
    end_to?: string;     // YYYY-MM-DD
  }
): Promise<TableDataResponse<APIFair>> {
  const response = await requestFunction(
    '/fairs/api/fairs.php',
    'GET',
    'fairs_list_paginated',
    params
  );
  // il backend risponde già nel formato TableDataResponse
  return response as TableDataResponse<APIFair>;
}

/** POST create */
export async function create_fair(
  fair_info: Pick<APIFair, 'name' | 'start_date' | 'end_date'> &
             Partial<Omit<APIFair, 'fair_uid' | 'duration_days' | 'created_at' | 'updated_at' | 'company_uid'>>
): Promise<DataResponse<APIFair>> {
  const response = await requestFunction(
    '/fairs/api/fairs.php',
    'POST',
    'create_fair',
    fair_info
  );
  return { response, data: response.data ? response.data as APIFair : undefined };
}

/** PUT update */
export async function update_fair(
  fair_info: Partial<Omit<APIFair, 'company_uid' | 'duration_days' | 'created_at' | 'updated_at'>> & { fair_uid: string }
): Promise<DataResponse<APIFair>> {
  const response = await requestFunction(
    '/fairs/api/fairs.php',
    'PUT',
    'update_fair',
    fair_info
  );
  return { response, data: response.data ? response.data as APIFair : undefined };
}

/** DELETE (utile dalla tabella) */
export async function delete_fair(
  { fair_uid }: { fair_uid: string }
): Promise<DataResponse<null>> {
  const response = await requestFunction(
    '/fairs/api/fairs.php',
    'DELETE',
    'fair_info',
    { fair_uid }
  );
  return { response, data: undefined };
}
