import api from './api'; // <-- Importa 'api', NO 'axios'
import type { Producto } from '../types';

export const getProductos = async (): Promise<Producto[]> => {
    const response = await api.get('/productos'); // <-- Usa 'api'
    return response.data;
};