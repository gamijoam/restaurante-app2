import api from './api';
import apiClient from './api';
import type { ComandaResponseDTO } from '../types';
import type { ComandaRequestDTO, ItemRequestDTO } from '../dto/comandaDTOs';

// La URL base /api/v1 ya está en nuestra instancia de 'api'
const API_URL_COMANDAS = '/comandas';

export const crearComandaAPI = async (comandaData: ComandaRequestDTO): Promise<ComandaResponseDTO> => {
    const response = await api.post(API_URL_COMANDAS, comandaData);
    return response.data;
};

export const getComandasPorMultiplesEstados = async (estados: string[]): Promise<ComandaResponseDTO[]> => {
    const estadosQuery = estados.join(',');
    const response = await api.get(`${API_URL_COMANDAS}?estados=${estadosQuery}`);
    return response.data;
};

export const updateComandaEstado = async (id: number, estado: string): Promise<ComandaResponseDTO> => {
    const response = await api.put(`${API_URL_COMANDAS}/${id}/estado`, { estado });
    return response.data;
};

export const agregarItemsAComandaAPI = async (comandaId: number, items: ItemRequestDTO[]): Promise<ComandaResponseDTO> => {
    const response = await api.post(`${API_URL_COMANDAS}/${comandaId}/items`, items);
    return response.data;
};

export const limpiarItemsComandaAPI = async (comandaId: number): Promise<void> => {
    await api.delete(`${API_URL_COMANDAS}/${comandaId}/items`);
};
// Definimos las interfaces para el DTO que viene del backend
export interface TicketItem {
    cantidad: number;
    nombreProducto: string;
    precioUnitario: number;
    precioTotal: number;
}

export interface TicketData {
    comandaId: number;
    nombreMesa: string;
    fechaHora: string; // Se recibe como string, se puede convertir a Date si es necesario
    items: TicketItem[];
    total: number;
}

// Añade esta nueva función al final del archivo
export const getTicketData = async (comandaId: number): Promise<TicketData> => {
    const response = await apiClient.get<TicketData>(`/api/v1/comandas/${comandaId}/ticket`);
    return response.data;
};