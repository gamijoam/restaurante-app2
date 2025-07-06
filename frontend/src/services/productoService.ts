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

export const createProducto = async (producto: Omit<Producto, 'id'>): Promise<Producto> => {
    const response = await api.post('/productos', producto);
    return response.data;
};

export const updateProducto = async (id: number, producto: Producto): Promise<Producto> => {
    const response = await api.put(`/productos/${id}`, producto);
    return response.data;
};

export const deleteProducto = async (id: number): Promise<void> => {
    await api.delete(`/productos/${id}`);
};