import api from './api'; // Usamos nuestra instancia de Axios configurada

// Esta interfaz debe coincidir con la entidad del backend
export interface PrinterConfig {
    id?: number; // El ID es opcional al crear
    role: string;
    printerType: string;
    printerTarget: string;
    areaId?: string;
}

// Obtener todas las configuraciones
export const getAllPrinterConfigs = async (): Promise<PrinterConfig[]> => {
    const response = await api.get('/printer-configurations');
    return response.data;
};

// Guardar (crear o actualizar) una configuración
export const savePrinterConfig = async (config: PrinterConfig): Promise<PrinterConfig> => {
    const response = await api.post('/printer-configurations', config);
    return response.data;
};

// Eliminar una configuración por su ID
export const deletePrinterConfig = async (id: number): Promise<void> => {
    await api.delete(`/printer-configurations/${id}`);
};