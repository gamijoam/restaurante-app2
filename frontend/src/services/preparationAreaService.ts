import api from './api';

export interface PreparationArea {
  id: number;
  name: string;
  areaId: string;
  type: string;
  description?: string;
  active: boolean;
  orderIndex: number;
}

export const getAreasPreparacion = async (): Promise<PreparationArea[]> => {
    const response = await api.get('/preparation-areas');
    return response.data;
};

export const getAreaPreparacionById = async (id: number): Promise<PreparationArea> => {
    const response = await api.get(`/preparation-areas/${id}`);
    return response.data;
};

export const createAreaPreparacion = async (area: Omit<PreparationArea, 'id'>): Promise<PreparationArea> => {
    const response = await api.post('/preparation-areas', area);
    return response.data;
};

export const updateAreaPreparacion = async (id: number, area: PreparationArea): Promise<PreparationArea> => {
    const response = await api.put(`/preparation-areas/${id}`, area);
    return response.data;
};

export const deleteAreaPreparacion = async (id: number): Promise<void> => {
    await api.delete(`/preparation-areas/${id}`);
}; 