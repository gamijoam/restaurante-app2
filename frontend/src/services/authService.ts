import axios from 'axios';
import type { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '../dto/authDTOs'; // Crearemos este archivo ahora

const API_URL = 'http://localhost:8080/api/auth';

export const loginAPI = async (credentials: LoginRequestDTO): Promise<AuthResponseDTO> => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
};

export const registerAPI = async (userData: RegisterRequestDTO): Promise<AuthResponseDTO> => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
};