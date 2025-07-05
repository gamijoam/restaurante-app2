import api from './api'; // 1. Usamos una sola importación
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

// --- Tipos para el Ticket (esto estaba bien) ---
export interface TicketItem {
    cantidad: number;
    nombreProducto: string;
    precioUnitario: number;
    precioTotal: number;
}

export interface TicketData {
    comandaId: number;
    nombreMesa: string;
    fechaHora: string;
    items: TicketItem[];
    total: number;
}

// --- Función para obtener el Ticket (CORREGIDA) ---
export const getTicketData = async (comandaId: number): Promise<TicketData> => {
    // 2. Usamos 'api' en lugar de 'apiClient'
    // 3. La URL ya no tiene el '/api/v1' duplicado
    const response = await api.get<TicketData>(`${API_URL_COMANDAS}/${comandaId}/ticket`);
    return response.data;
};