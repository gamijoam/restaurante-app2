import api from './api';

export const getImpuesto = async (): Promise<number> => {
  const response = await api.get('/config/impuesto');
  return response.data;
};

export const setImpuesto = async (nuevoImpuesto: number): Promise<void> => {
  await api.put('/config/impuesto', nuevoImpuesto, {
    headers: { 'Content-Type': 'application/json' },
  });
}; 