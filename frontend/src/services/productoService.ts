import axios from 'axios';
import type { Producto } from '../types';

const API_URL = '/api/v1/productos'; // Gracias al proxy, esto apunta a localhost:8080

export const getProductos = async (): Promise<Producto[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};