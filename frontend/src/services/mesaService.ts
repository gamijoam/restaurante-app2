import api from './api'; // <-- Importa 'api', NO 'axios'
import type { Mesa } from '../types';

export const getMesas = async (): Promise<Mesa[]> => {
    const response = await api.get('/mesas'); // <-- Usa 'api'
    return response.data;
};