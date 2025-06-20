import api from './api';
import type { ComandaResponseDTO } from '../types';
import type { ComandaRequestDTO, ItemRequestDTO } from '../dto/comandaDTOs';

const API_URL = '/comandas';

export const crearComandaAPI = async (comandaData: ComandaRequestDTO): Promise<ComandaResponseDTO> => {
    const response = await api.post(API_URL, comandaData);
    return response.data;
};

export const getComandasPorMultiplesEstados = async (estados: string[]): Promise<ComandaResponseDTO[]> => {
    const estadosQuery = estados.join(',');
    const response = await api.get(`${API_URL}?estados=${estadosQuery}`);
    return response.data;
};

export const updateComandaEstado = async (id: number, estado: string): Promise<ComandaResponseDTO> => {
    const response = await api.put(`${API_URL}/${id}/estado`, { estado });
    return response.data;
};

export const agregarItemsAComandaAPI = async (comandaId: number, items: ItemRequestDTO[]): Promise<ComandaResponseDTO> => {
    const response = await api.post(`${API_URL}/${comandaId}/items`, items);
    return response.data;
};