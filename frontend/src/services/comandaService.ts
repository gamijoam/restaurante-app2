import axios from 'axios';
import type { ComandaResponseDTO } from '../types';
import type { ComandaRequestDTO } from '../dto/ComandaRequestDTO';

const API_URL = 'http://localhost:8080/api/v1/comandas';

export const crearComandaAPI = async (comandaData: ComandaRequestDTO): Promise<ComandaResponseDTO> => {
    const response = await axios.post(API_URL, comandaData);
    return response.data;
};

export const getComandasPorMultiplesEstados = async (estados: string[]): Promise<ComandaResponseDTO[]> => {
    const estadosQuery = estados.join(',');
    const response = await axios.get(`${API_URL}?estados=${estadosQuery}`);
    return response.data;
};

export const updateComandaEstado = async (id: number, estado: string): Promise<ComandaResponseDTO> => {
    const response = await axios.put(`${API_URL}/${id}/estado`, { estado });
    return response.data;
};