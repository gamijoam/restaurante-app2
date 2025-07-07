import api from './api';

export interface Permiso {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
}

export const getPermisos = async (): Promise<Permiso[]> => {
    const response = await api.get('/permisos');
    return response.data;
};

export const getPermisoById = async (id: number): Promise<Permiso> => {
    const response = await api.get(`/permisos/${id}`);
    return response.data;
};

export const createPermiso = async (permiso: Omit<Permiso, 'id'>): Promise<Permiso> => {
    const response = await api.post('/permisos', permiso);
    return response.data;
};

export const updatePermiso = async (id: number, permiso: Partial<Permiso>): Promise<Permiso> => {
    const response = await api.put(`/permisos/${id}`, permiso);
    return response.data;
};

export const deletePermiso = async (id: number): Promise<void> => {
    await api.delete(`/permisos/${id}`);
};

export const getPermisosUsuario = async (userId: number): Promise<Permiso[]> => {
    const response = await api.get(`/permisos/usuario/${userId}`);
    return response.data;
};

export const updatePermisosUsuario = async (userId: number, permisoIds: number[]): Promise<any> => {
    const response = await api.put(`/permisos/usuario/${userId}`, permisoIds);
    return response.data;
}; 