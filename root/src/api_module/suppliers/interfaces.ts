export type APISupplier = {
    supplier_uid: string;

    company_name: string;
    cf: string;
    piva: string;

    indirizzo: string;
    cap: string;
    city: string;
    province: string;
    region: string;
    state: string;

    note: string;
} & SupplierRef;

export type SupplierRef = {
    ref_name: string;
    ref_phone: string;
    ref_fax: string;
    ref_email: string;
    ref_pec: string;
}