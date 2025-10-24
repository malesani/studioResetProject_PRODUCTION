import { requestFunction, DataResponse, TableDataResponse } from '../../hooks/RequestFunction';
import { TableFilters } from '../../app_components/TableData/interfaces';

import { APISupplier } from '../suppliers/interfaces';
export type { APISupplier } from '../suppliers/interfaces';

/** GET singolo */
export async function get_supplierByUid(
  { supplier_uid }: { supplier_uid: string }
): Promise<DataResponse<APISupplier>> {
  const response = await requestFunction(
    '/suppliers/api/suppliers.php',
    'GET',
    'supplier_info',
    { supplier_uid }
  );
  return { response, data: response.data ? (response.data as APISupplier) : undefined };
}

/** GET lista completa (non paginata) – mantiene il pattern { filters } come per i prodotti */
export async function get_suppliersList<T>(
  filters: Partial<Record<'search' | 'region' | 'state', string>>
    & Partial<Record<keyof T, string | number>>
): Promise<DataResponse<APISupplier>> {
  const response = await requestFunction(
    '/suppliers/api/suppliers.php',
    'GET',
    'suppliers_list',
    { filters } // ← stesso schema dei prodotti
  );

  // pattern analogo a products (pass-through del payload)
  if (response.success && response.data?.project_info) {
    return { response, data: response.data.project_info };
  }
  return { response };
}

/** GET lista paginata */
export async function get_suppliersListPaginated(
  params: TableFilters<APISupplier> & {
    region?: string;
    state?: string;
  }
): Promise<TableDataResponse<APISupplier>> {
  const response = await requestFunction(
    '/suppliers/api/suppliers.php',
    'GET',
    'suppliers_list_paginated',
    params
  );
  return response as TableDataResponse<APISupplier>;
}

/** POST create */
export async function create_supplier(
  supplier_info: Pick<APISupplier, 'company_name'> & Partial<Omit<APISupplier, 'supplier_uid'>>
): Promise<DataResponse<APISupplier>> {
  const response = await requestFunction(
    '/suppliers/api/suppliers.php',
    'POST',
    'create_supplier',
    supplier_info
  );
  return { response, data: response.data ? (response.data as APISupplier) : undefined };
}

/** PUT update */
export async function update_supplier(
  supplier_info: Partial<APISupplier> & { supplier_uid: string }
): Promise<DataResponse<APISupplier>> {
  const response = await requestFunction(
    '/suppliers/api/suppliers.php',
    'PUT',
    'update_supplier',
    supplier_info
  );
  return { response, data: response.data ? (response.data as APISupplier) : undefined };
}
