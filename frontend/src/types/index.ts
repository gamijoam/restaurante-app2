
export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string; // Obligatorio
}

export interface Mesa {
    id: number;
    numero: number;
    capacidad: number;
    estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO' | 'LISTA_PARA_PAGAR';
}

// --- AÑADIR ESTAS DOS NUEVAS INTERFACES ---

export interface ComandaItemResponseDTO {
    productoId: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    // El precio total se calcula y no viene en este DTO
    esNuevo?: boolean;
}

export interface ComandaResponseDTO {
    id: number;
    numeroMesa: number; // Asegúrate de que aquí diga numeroMesa
    nombreMesa?: string; // Puedes dejar nombreMesa como opcional o eliminarlo
    items: ComandaItemResponseDTO[];
    estado: 'EN_PROCESO' | 'LISTA' | 'ENTREGADA' | 'PAGADA' | 'CANCELADA';
    fechaHoraCreacion: string;
    total: number;
}
// ... (debajo de las otras interfaces)

// --- Tipos para Reportes ---

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
    estado: string;
}

export interface PreparationArea {
  id: number;
  name: string;
  areaId: string;
  type: string;
  description?: string;
  active: boolean;
  orderIndex: number;
}

export interface ComandaAreaResponseDTO {
  id: number;
  comandaId: number;
  areaId: number;
  areaNombre: string;
  mesaId: number;
  estado: string;
  fechaCreacion: string;
  items: Array<{
    id: number;
    productoId: number;
    productoNombre: string;
    cantidad: number;
    observaciones?: string;
    esNuevo?: boolean;
  }>;
}