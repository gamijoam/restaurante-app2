import api from './api';
import type { Producto } from '../types';

export const getProductos = async (): Promise<Producto[]> => {
    const response = await api.get('/productos');
    return response.data;
};