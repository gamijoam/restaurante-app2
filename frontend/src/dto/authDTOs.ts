export interface LoginRequestDTO {
    username: string;
    password: string;
}

export interface RegisterRequestDTO {
    email: unknown;
    roles: "" | string[] | undefined;
    username: string;
    password: string;
    nombre: string;
}

export interface AuthResponseDTO {
    token: string;
}