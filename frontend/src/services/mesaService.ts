import api from './api';
import type { Mesa, ComandaResponseDTO } from '../types';

const API_URL = '/mesas';

export const getMesas = async (): Promise<Mesa[]> => {
    const response = await api.get(API_URL);
    return response.data;
};

export const getComandaActivaPorMesa = async (mesaId: number): Promise<ComandaResponseDTO> => {
    // --- URL CONSTRUIDA CORRECTAMENTE ---
    const response = await api.get(`${API_URL}/${mesaId}/comanda-activa`);
    return response.data;
};