import api from './api'; // <-- Importa 'api', NO 'axios'
import type { ComandaResponseDTO } from '../types';
import type { ComandaRequestDTO } from '../dto/ComandaRequestDTO';

// El AuthController es público, por lo que todavía usa axios directamente.
// Para los endpoints de comandas, usamos nuestra instancia 'api'.
export const crearComandaAPI = async (comandaData: ComandaRequestDTO): Promise<ComandaResponseDTO> => {
    const response = await api.post('/comandas', comandaData);
    return response.data;
};

export const getComandasPorMultiplesEstados = async (estados: string[]): Promise<ComandaResponseDTO[]> => {
    const estadosQuery = estados.join(',');
    const response = await api.get(`/comandas?estados=${estadosQuery}`);
    return response.data;
};

export const updateComandaEstado = async (id: number, estado: string): Promise<ComandaResponseDTO> => {
    const response = await api.put(`/comandas/${id}/estado`, { estado });
    return response.data;
};