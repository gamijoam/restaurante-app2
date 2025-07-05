import api from './api';

export interface Mesa {
    id?: number;
    numero: number;
    capacidad: number;
    estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO' | 'LISTA_PARA_PAGAR';
    posicionX?: number;
    posicionY?: number;
    nombre?: string;
}

export interface MesaMapa {
    id: number;
    numero: number;
    capacidad: number;
    estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO' | 'LISTA_PARA_PAGAR';
    posicionX?: number;
    posicionY?: number;
    nombre?: string;
    colorEstado: string;
    estadoTexto: string;
}

export const getMesas = async (): Promise<Mesa[]> => {
    const response = await api.get('/mesas');
    return response.data;
};

export const getMesaById = async (id: number): Promise<Mesa> => {
    const response = await api.get(`/mesas/${id}`);
    return response.data;
};

export const createMesa = async (mesa: Omit<Mesa, 'id'>): Promise<Mesa> => {
    const response = await api.post('/mesas', mesa);
    return response.data;
};

export const updateMesaEstado = async (id: number, estado: string): Promise<Mesa> => {
    const response = await api.put(`/mesas/${id}/estado`, { estado });
    return response.data;
};

export const getComandaActivaPorMesa = async (id: number) => {
    const response = await api.get(`/mesas/${id}/comanda-activa`);
    return response.data;
};

// --- NUEVOS MÉTODOS PARA EL MAPA ---

export const getMesasMapa = async (): Promise<MesaMapa[]> => {
    const response = await api.get('/mesas/mapa');
    return response.data;
};

export const updateMesaPosicion = async (id: number, posicionX: number, posicionY: number, nombre?: string): Promise<Mesa> => {
    const payload: any = { 
        posicionX: posicionX, 
        posicionY: posicionY 
    };
    if (nombre) payload.nombre = nombre;
    
    console.log('Enviando payload al backend:', payload);
    
    const response = await api.put(`/mesas/${id}/posicion`, payload);
    console.log('Respuesta del backend:', response.data);
    return response.data;
};

export const updateMesasPosiciones = async (mesasData: Array<{
    id: number;
    posicionX: number;
    posicionY: number;
    nombre?: string;
}>): Promise<Mesa[]> => {
    const response = await api.put('/mesas/posiciones', mesasData);
    return response.data;
};

export const deleteMesa = async (id: number): Promise<void> => {
    await api.delete(`/mesas/${id}`);
};