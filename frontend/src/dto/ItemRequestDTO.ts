export interface ItemRequestDTO {
    productoId: number;
    cantidad: number;
    itemPrincipalId?: number; // Opcional, si es adicional de otro item
}