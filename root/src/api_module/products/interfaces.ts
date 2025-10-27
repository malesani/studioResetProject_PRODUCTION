type InfoProductPrice = {
    purchase_price?: number;        // Costo
    selling_price?: number;          // Vendita
    rental_price?: number;           // Noleggio
}
type InfoProductSupplier = {
    suppl_code?: string;
    suppl_name?: string;
    suppl_artCode?: string;
    suppl_note?: string;
}

type InfoDimensions = {
    dim_X: number;
    dim_Y: number;
    dim_Z: number;
    um_dim: number;
    weigth: number;
    um_weigth: number;
}

export type APIProduct = {
    art_code: string;
    name: string;
    description?: string;

    // Info
    um?: string;
    type?: string;
    commission_class?: string;

    tax_val?: number;

    category?: string;
    subCategory?: string;
} & InfoProductPrice & InfoDimensions & InfoProductSupplier;