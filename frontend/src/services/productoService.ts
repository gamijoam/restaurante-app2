import axios from 'axios';
import type { Producto } from '../types';

const API_URL = 'http://localhost:8080/api/v1/productos';

export const getProductos = async (): Promise<Producto[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};