import { requestFunction, DataResponse, TableDataResponse } from '../../hooks/RequestFunction';
import { TableFilters } from '../../app_components/TableData/interfaces';

import { APIProduct } from './interfaces';
export type { APIProduct } from './interfaces';
export type CategoryTree = Record<string, string[]>;

/** GET singolo */
export async function get_productByArtCode(
    { art_code }: { art_code: string }
): Promise<DataResponse<APIProduct>> {
    const response = await requestFunction(
        '/products/api/products.php',
        'GET',
        'product_info',
        { art_code }
    );
    return { response: response, data: response.data ? response.data : undefined };
}

export async function get_productsList<T>(
    filters: Partial<Record<'search', string>> & Partial<Record<keyof T, string | number>>
): Promise<DataResponse<APIProduct>> {
    const response = await requestFunction(
        '/products/api/products.php',
        'GET',
        'products_list',
        { filters }
    );

    if (response.success && response.data?.project_info) {
        return { response, data: response.data.project_info };
    }
    return { response };
}


export async function get_productsListPaginated(
    params: TableFilters<APIProduct>
): Promise<TableDataResponse<APIProduct>> {
    const response = await requestFunction(
        '/products/api/products.php',
        'GET',
        'products_list_paginated',
        params
    );

    return response as TableDataResponse<APIProduct>;
}

/** GET category tree */
export async function get_categoryTree(): Promise<DataResponse<CategoryTree>> {
    const response = await requestFunction(
        '/products/api/products.php',
        'GET',
        'categoryTree',
        {} // nessun parametro richiesto
    );

    return { response, data: response.data ? (response.data as CategoryTree) : undefined };
}

/** POST created */
export async function create_product(
    product_info: APIProduct
): Promise<DataResponse<APIProduct>> {
    const payload = product_info;
    const response = await requestFunction(
        '/products/api/products.php',
        'POST',
        'create_product',
        payload
    );
    return { response: response, data: response.data ? response.data : undefined };
}

/** PUT update */
export async function update_product(
    product_info: APIProduct
): Promise<DataResponse<APIProduct>> {
    const response = await requestFunction(
        '/products/api/products.php',
        'PUT',
        'update_product',
        product_info
    );

    return { response: response, data: response.data ? response.data : undefined };
}