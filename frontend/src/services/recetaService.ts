import api from './api';

export interface RecetaIngrediente {
    id?: number;
    productoId?: number;
    ingredienteId: number;
    ingredienteNombre?: string;
    cantidad: number;
    unidad?: string;
}

export const getRecetasByProducto = async (productoId: number): Promise<RecetaIngrediente[]> => {
    const response = await api.get(`/recetas/producto/${productoId}`);
    return response.data;
};

export const actualizarRecetaProducto = async (productoId: number, recetas: RecetaIngrediente[]): Promise<void> => {
    await api.post(`/recetas/producto/${productoId}`, recetas);
};

export const deleteReceta = async (id: number): Promise<void> => {
    await api.delete(`/recetas/${id}`);
}; 