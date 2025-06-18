import axios from 'axios';
import type { ComandaResponseDTO } from '../types';
import type { ComandaRequestDTO } from '../dto/ComandaRequestDTO';

const API_URL = '/api/v1/comandas';

export const crearComandaAPI = async (comandaData: ComandaRequestDTO): Promise<ComandaResponseDTO> => {
    const response = await axios.post(API_URL, comandaData);
    return response.data;
};

export const getComandasPorEstado = async (estado: string): Promise<ComandaResponseDTO[]> => {
    const response = await axios.get(`${API_URL}?estado=${estado}`);
    return response.data;
};

export const updateComandaEstado = async (id: number, estado: string): Promise<ComandaResponseDTO> => {
    // ---- ¡LA CORRECCIÓN ESTÁ AQUÍ! ----
    // Nos aseguramos de que esta URL también use las comillas invertidas correctas.
    const response = await axios.put(`${API_URL}/${id}/estado`, { estado });
    return response.data;
};