export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
}
// ... (debajo de la interfaz Producto)
export interface Mesa {
    id: number;
    numero: number;
    capacidad: number;
    estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
}