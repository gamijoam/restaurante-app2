import axios from 'axios';

const API_URL = '/api/v1/comandas';

// Usamos 'any' temporalmente en los tipos para simplificar la depuración
export const crearComandaAPI = async (comandaData: any): Promise<any> => {
    // ----- LOG NÚMERO 3 -----
    console.log("3. A punto de enviar la petición POST a la API con estos datos:", comandaData);

    const response = await axios.post(API_URL, comandaData);
    return response.data;
};