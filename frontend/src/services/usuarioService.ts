import api from './api'; // Usamos nuestra instancia de axios con el token
import type { UsuarioResponseDTO } from '../types';
import type { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '../dto/authDTOs';
export const getUsuarios = async (): Promise<UsuarioResponseDTO[]> => {
    const response = await api.get('/usuarios');
    return response.data;
};