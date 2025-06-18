import axios from 'axios';
import type { Mesa } from '../types';

const API_URL = 'http://localhost:8080/api/v1/mesas';

export const getMesas = async (): Promise<Mesa[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};