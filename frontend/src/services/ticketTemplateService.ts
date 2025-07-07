import api from './api';

export interface TicketTemplateDTO {
  id?: number;
  name: string;
  area: string;
  isDefault?: boolean;
  blocks: TicketBlockDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketBlockDTO {
  id?: string;
  type: 'text' | 'line' | 'table' | 'total' | 'qr' | 'logo' | 'datetime';
  value?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  label?: string;
  field?: string;
  format?: string;
  columns?: string[];
}

export interface Area {
  id?: number;
  areaId: string;
  name: string;
  description?: string;
}

// Obtener todas las áreas
export const getAreas = async (): Promise<Area[]> => {
  const response = await api.get('/ticket-templates/areas');
  return response.data;
};

// Crear nueva área
export const createArea = async (area: Omit<Area, 'id'>): Promise<Area> => {
  const response = await api.post('/ticket-templates/areas', area);
  return response.data;
};

// Obtener plantilla por área
export const getTemplateByArea = async (areaId: string): Promise<TicketTemplateDTO | null> => {
  try {
    const response = await api.get(`/ticket-templates/area/${areaId}`);
    return response.data;
  } catch (error) {
    if ((error as any).response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Guardar plantilla
export const saveTemplate = async (template: TicketTemplateDTO): Promise<TicketTemplateDTO> => {
  const response = await api.post('/ticket-templates', template);
  return response.data;
};

// Actualizar plantilla
export const updateTemplate = async (id: number, template: TicketTemplateDTO): Promise<TicketTemplateDTO> => {
  const response = await api.put(`/ticket-templates/${id}`, template);
  return response.data;
};

// Obtener todas las plantillas
export const getAllTemplates = async (): Promise<TicketTemplateDTO[]> => {
  const response = await api.get('/ticket-templates');
  return response.data;
};

// Eliminar plantilla
export const deleteTemplate = async (id: number): Promise<void> => {
  await api.delete(`/ticket-templates/${id}`);
};

// Crear plantilla por defecto para un área
export const createDefaultTemplate = async (areaId: string, areaName: string): Promise<TicketTemplateDTO> => {
  const response = await api.post(`/ticket-templates/default/${areaId}?areaName=${encodeURIComponent(areaName)}`);
  return response.data;
};

// Generar previsualización PDF de una plantilla guardada
export const generatePreview = async (id: number): Promise<Blob> => {
  const response = await api.post(`/ticket-templates/${id}/preview`, {}, {
    responseType: 'blob'
  });
  return response.data;
};

// Generar previsualización PDF de una plantilla temporal (sin guardar)
export const generatePreviewFromTemplate = async (template: TicketTemplateDTO): Promise<Blob> => {
  const response = await api.post('/ticket-templates/preview', template, {
    responseType: 'blob'
  });
  return response.data;
}; 