import { APIProduct } from '../products/interfaces';


export type EstimateItem = {

    quantity: number;
    mount_price?: number
    
    FP?: boolean;
    N?: boolean;
    V?: boolean;
    R?: boolean;

} & APIProduct;


export interface EstimateInfo {
    project_uid: string;
    preventivo_uid: string;
    customer_uid: string;
    tipo: string;
    fiera?: string;
    stato: string;
    validitaFino: string;
    descrizione: string;
    titolo: string;
    importo: string;
    note: string;
    items?: EstimateItem[];
}