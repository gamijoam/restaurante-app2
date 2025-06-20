import api from './api';
import type { ReporteVentasDTO } from '../dto/ReportesDTO';

export const getReporteVentas = async (fechaInicio: string, fechaFin: string): Promise<ReporteVentasDTO> => {

    // Validación para no enviar una petición si las fechas están vacías
    if (!fechaInicio || !fechaFin) {
        return Promise.reject(new Error("Las fechas de inicio y fin son requeridas."));
    }

    //
    // --- ESTA ES LA LÍNEA CRÍTICA Y CORREGIDA ---
    // Usa comillas invertidas (`) y la sintaxis ${} para construir la URL.
    //
    const response = await api.get(`/reportes/ventas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

    return response.data;
};