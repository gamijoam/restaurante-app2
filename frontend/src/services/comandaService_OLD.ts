import axios from 'axios';
import type { ComandaResponseDTO } from '../types';
import type { ComandaRequestDTO } from '../dto/ComandaRequestDTO';

// Usamos la URL completa para evitar cualquier problema con el proxy.
const API_BASE_URL = 'http://localhost:8080/api/v1';

export const crearComandaAPI = async (comandaData: ComandaRequestDTO): Promise<ComandaResponseDTO> => {
    const response = await axios.post(`${API_BASE_URL}/comandas`, comandaData);
    return response.data;
};

export const getComandasPorEstado = async (estado: string): Promise<ComandaResponseDTO[]> => {
    // CORRECCIÓN: Usando comillas invertidas (`) para construir la URL correctamente.
    const response = await axios.get(`${API_BASE_URL}/comandas?estados=${estado}`);
    return response.data;
};

export const getComandasPorMultiplesEstados = async (estados: string[]): Promise<ComandaResponseDTO[]> => {
    const estadosQuery = estados.join(',');
    // CORRECCIÓN: Usando comillas invertidas (`) para construir la URL correctamente.
    const response = await axios.get(`<span class="math-inline">\{API\_BASE\_URL\}/comandas?estados\=</span>{estadosQuery}`);
    return response.data;
};

export const updateComandaEstado = async (id: number, estado: string): Promise<ComandaResponseDTO> => {
    // CORRECCIÓN: Usando comillas invertidas (`) para construir la URL correctamente.
    const response = await axios.put(`${API_BASE_URL}/comandas/${id}/estado`, { estado });
    return response.data;
};

// Añadimos también los servicios que faltaban para productos y mesas con la URL completa
export const getProductos = async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/productos`);
    return response.data;
};

export const getMesas = async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/mesas`);
    return response.data;
};