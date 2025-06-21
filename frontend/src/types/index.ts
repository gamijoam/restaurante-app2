export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
}

export interface Mesa {
    id: number;
    numero: number;
    capacidad: number;
    estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
}

// --- AÑADIR ESTAS DOS NUEVAS INTERFACES ---

export interface ComandaItemResponseDTO {
    productoId: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
}

export interface ComandaResponseDTO {
    id: number;
    numeroMesa: number;
    items: ComandaItemResponseDTO[];
    estado: 'EN_PROCESO' | 'LISTA' | 'ENTREGADA' | 'PAGADA' | 'CANCELADA';
    fechaHoraCreacion: string; // Las fechas se suelen recibir como strings en formato ISO
    total: number;
}
// ... (debajo de las otras interfaces)

// --- Tipos para Reportes ---

export interface ProductoVendidoDTO {
    productoId: number;
    nombreProducto: string;
    cantidadTotal: number;
}

export interface ReporteVentasDTO {
    fechaInicio: string;
    fechaFin: string;
    numeroDeVentas: number;
    totalRecaudado: number;
    productosMasVendidos: ProductoVendidoDTO[];
}
// ... (debajo de las otras interfaces)

// --- Tipo para la Respuesta de la API de Usuarios ---

export interface UsuarioResponseDTO {
    id: number;
    username: string;
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
    roles: string[]; // Recibimos los roles como un array de strings
    fechaCreacion: string;
}
export interface FacturaResponseDTO {
    id: number;
    comandaId: number;
    numeroMesa: number;
    total: number;
    impuesto: number;
    fechaEmision: string; // Las fechas se reciben como strings
}