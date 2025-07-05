import axios from 'axios'; // Usaremos la instancia global de axios
import type { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '../dto/authDTOs';

const AUTH_API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const loginAPI = async (credentials: LoginRequestDTO): Promise<AuthResponseDTO> => {
    const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
    return response.data;
};

export const registerAPI = async (userData: RegisterRequestDTO): Promise<AuthResponseDTO> => {
    const response = await axios.post(`${AUTH_API_URL}/register`, userData);
    return response.data;
};