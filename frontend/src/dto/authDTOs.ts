export interface LoginRequestDTO {
    username: string;
    password: string;
}

export interface RegisterRequestDTO {
    username: string;
    password: string;
    nombre: string;
}

export interface AuthResponseDTO {
    token: string;
}