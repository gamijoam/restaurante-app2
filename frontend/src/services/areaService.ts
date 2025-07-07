import api from './api';

export interface PreparationArea {
  id?: number;
  areaId: string;
  name: string;
  type: string;
  description?: string;
  active: boolean;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductArea {
  id?: number;
  productId: number;
  areaId: string;
  preparationTime?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComandaArea {
  id?: number;
  comandaId: number;
  areaId: string;
  status: string;
  assignedTo?: string;
  notes?: string;
  estimatedTime?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComandaAreaItem {
  id?: number;
  comandaAreaId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  notes?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// PreparationArea endpoints
export const areaService = {
  // Obtener todas las áreas
  getAll: () => api.get<PreparationArea[]>('/areas'),
  
  // Obtener áreas activas
  getActive: () => api.get<PreparationArea[]>('/areas/active'),
  
  // Obtener área por ID
  getById: (id: number) => api.get<PreparationArea>(`/areas/${id}`),
  
  // Crear área
  create: (area: PreparationArea) => api.post<PreparationArea>('/areas', area),
  
  // Actualizar área
  update: (id: number, area: PreparationArea) => api.put<PreparationArea>(`/areas/${id}`, area),
  
  // Eliminar área
  delete: (id: number) => api.delete(`/areas/${id}`),
};

// ProductArea endpoints
export const productAreaService = {
  // Obtener todas las asignaciones
  getAll: () => api.get<ProductArea[]>('/product-areas'),
  
  // Obtener productos por área
  getByArea: (areaId: string) => api.get<ProductArea[]>(`/product-areas/area/${areaId}`),
  
  // Obtener áreas por producto
  getByProduct: (productId: number) => api.get<ProductArea[]>(`/product-areas/product/${productId}`),
  
  // Obtener por ID
  getById: (id: number) => api.get<ProductArea>(`/product-areas/${id}`),
  
  // Crear asignación
  create: (productArea: ProductArea) => api.post<ProductArea>('/product-areas', productArea),
  
  // Actualizar asignación
  update: (id: number, productArea: ProductArea) => api.put<ProductArea>(`/product-areas/${id}`, productArea),
  
  // Eliminar asignación
  delete: (id: number) => api.delete(`/product-areas/${id}`),
};

// ComandaArea endpoints
export const comandaAreaService = {
  // Obtener todas las comandas por área
  getAll: () => api.get<ComandaArea[]>('/comanda-areas'),
  
  // Obtener comandas por área
  getByArea: (areaId: string, status?: string) => {
    const params = status ? `?status=${status}` : '';
    return api.get<ComandaArea[]>(`/comanda-areas/area/${areaId}${params}`);
  },
  
  // Obtener por ID
  getById: (id: number) => api.get<ComandaArea>(`/comanda-areas/${id}`),
  
  // Crear comanda por área
  create: (comandaArea: ComandaArea) => api.post<ComandaArea>('/comanda-areas', comandaArea),
  
  // Actualizar comanda por área
  update: (id: number, comandaArea: ComandaArea) => api.put<ComandaArea>(`/comanda-areas/${id}`, comandaArea),
  
  // Eliminar comanda por área
  delete: (id: number) => api.delete(`/comanda-areas/${id}`),
  
  // Obtener items de una comanda por área
  getItems: (id: number) => api.get<ComandaAreaItem[]>(`/comanda-areas/${id}/items`),
}; 