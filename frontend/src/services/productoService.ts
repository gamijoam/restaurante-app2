import api from './api';
import type { Producto } from '../types';

export const getProductos = async (): Promise<Producto[]> => {
    const response = await api.get('/productos');
    return response.data;
};

export const getStockDisponibleProducto = async (productoId: number): Promise<number> => {
    const response = await api.get(`/productos/${productoId}/stock-disponible`);
    return response.data;
};