import axios from 'axios';
import type { Mesa } from '../types'; // Necesitaremos añadir Mesa a nuestros tipos

const API_URL = '/api/v1/mesas';

export const getMesas = async (): Promise<Mesa[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};