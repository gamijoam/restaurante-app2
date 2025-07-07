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

export const actualizarRecetaProducto = async (productoId: number, recetas: RecetaIngrediente | RecetaIngrediente[]): Promise<void> => {
    // Si es un objeto individual, lo convertimos a array
    const recetasArray = Array.isArray(recetas) ? recetas : [recetas];
    await api.post(`/recetas/producto/${productoId}`, recetasArray);
};

export const agregarIngredienteAProducto = async (productoId: number, receta: RecetaIngrediente): Promise<RecetaIngrediente> => {
    const response = await api.post(`/recetas/producto/${productoId}/ingrediente`, receta);
    return response.data;
};

export const actualizarReceta = async (id: number, receta: RecetaIngrediente): Promise<RecetaIngrediente> => {
    const response = await api.put(`/recetas/${id}`, receta);
    return response.data;
};

export const deleteReceta = async (id: number): Promise<void> => {
    await api.delete(`/recetas/${id}`);
}; 