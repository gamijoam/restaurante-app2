// frontend/src/dto/ReportesDTO.ts

export interface ProductoVendidoDTO {
    productoId: number;
    nombreProducto: string;
    cantidadTotal: number;
    precioUnitario: number;
}

export interface ReporteVentasDTO {
    fechaInicio: string;
    fechaFin: string;
    numeroDeVentas: number;
    totalRecaudado: number;
    productosMasVendidos: ProductoVendidoDTO[];
}