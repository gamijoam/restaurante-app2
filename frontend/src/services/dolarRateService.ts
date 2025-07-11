import api from './api';

export interface DolarRateDTO {
    id: number;
    fecha: string;
    precioDolar: number;
    activo: boolean;
    fechaCreacion: string;
    fechaActualizacion?: string;
}

export interface DolarRateRequestDTO {
    fecha: string;
    precioDolar: number;
}

export const dolarRateService = {
    // Obtener todos los precios del dólar
    async getAllPreciosDolar(): Promise<DolarRateDTO[]> {
        const response = await api.get('/dolar-rates');
        return response.data;
    },

    // Obtener el precio del dólar de hoy
    async getPrecioDolarHoy(): Promise<number | null> {
        try {
            const response = await api.get('/dolar-rates/hoy');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo precio del dólar de hoy:', error);
            return null;
        }
    },

    // Obtener precio del dólar por fecha
    async getPrecioDolarPorFecha(fecha: string): Promise<number | null> {
        try {
            const response = await api.get(`/dolar-rates/fecha/${fecha}`);
            return response.data;
        } catch (error) {
            console.error(`Error obteniendo precio del dólar para fecha ${fecha}:`, error);
            return null;
        }
    },

    // Convertir USD a Bs
    async convertirUsdABs(precioUsd: number): Promise<number> {
        try {
            const response = await api.post('/dolar-rates/convertir', precioUsd);
            return response.data;
        } catch (error) {
            console.error('Error convirtiendo USD a Bs:', error);
            return 0;
        }
    },

    // Crear o actualizar precio del dólar
    async crearOActualizarPrecioDolar(request: DolarRateRequestDTO): Promise<DolarRateDTO> {
        const response = await api.post('/dolar-rates', request);
        return response.data;
    },

    // Obtener precio del dólar por ID
    async getPrecioDolarById(id: number): Promise<DolarRateDTO> {
        const response = await api.get(`/dolar-rates/${id}`);
        return response.data;
    },

    // Desactivar precio del dólar
    async desactivarPrecioDolar(id: number): Promise<void> {
        await api.delete(`/dolar-rates/${id}`);
    }
}; 