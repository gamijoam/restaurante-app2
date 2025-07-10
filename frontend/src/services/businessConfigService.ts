import api from './api';

export interface BusinessConfig {
    id?: number;
    businessName: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl?: string;
    description: string;
    taxRate: number;
    currency: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const getBusinessConfig = async (): Promise<BusinessConfig> => {
    const response = await api.get('/business-config');
    return response.data;
};

export const saveBusinessConfig = async (config: BusinessConfig): Promise<BusinessConfig> => {
    const response = await api.post('/business-config', config);
    return response.data;
};

export const updateBusinessConfig = async (id: number, config: BusinessConfig): Promise<BusinessConfig> => {
    const response = await api.put(`/business-config/${id}`, config);
    return response.data;
}; 