import api from './api';
import type { FacturaResponseDTO } from '../types';

export const getFacturas = async (fechaInicio?: string, fechaFin?: string): Promise<FacturaResponseDTO[]> => {
    let url = '/facturas';

    // ESTA ES LA LÓGICA CORRECTA QUE DEBE ESTAR EN TU ARCHIVO
    if (fechaInicio && fechaFin) {
        url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }
    
    const response = await api.get(url);
    return response.data;
};

export const descargarFacturaPdf = async (facturaId: number): Promise<Blob> => {
    const response = await api.get(`/facturas/${facturaId}/pdf`, {
        responseType: 'blob',
    });
    return new Blob([response.data], { type: 'application/pdf' });
};

export const updateFacturaEstado = async (facturaId: number, estado: string): Promise<FacturaResponseDTO> => {
    const response = await api.put(`/facturas/${facturaId}/estado`, { estado });
    return response.data;
};