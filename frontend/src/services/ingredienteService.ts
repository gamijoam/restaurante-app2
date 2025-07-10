import api from './api';

export interface Ingrediente {
    id?: number;
    nombre: string;
    stock: number;
    unidad: string;
    descripcion?: string;
    precio_unitario: number;
}

export const getIngredientes = async (): Promise<Ingrediente[]> => {
    const response = await api.get('/ingredientes');
    return response.data;
};

export const getIngredienteById = async (id: number): Promise<Ingrediente> => {
    const response = await api.get(`/ingredientes/${id}`);
    return response.data;
};

export const createIngrediente = async (ingrediente: Ingrediente): Promise<Ingrediente> => {
    const response = await api.post('/ingredientes', ingrediente);
    return response.data;
};

export const updateIngrediente = async (id: number, ingrediente: Ingrediente): Promise<Ingrediente> => {
    const response = await api.put(`/ingredientes/${id}`, ingrediente);
    return response.data;
};

export const deleteIngrediente = async (id: number): Promise<void> => {
    await api.delete(`/ingredientes/${id}`);
};

export const getStockIngrediente = async (id: number): Promise<number> => {
    const response = await api.get(`/ingredientes/${id}/stock`);
    return response.data;
};

export const ingresarStockIngrediente = async (ingredienteId: number, cantidad: number): Promise<void> => {
    await api.post(`/ingredientes/${ingredienteId}/ingresar-stock`, { cantidad });
}; 