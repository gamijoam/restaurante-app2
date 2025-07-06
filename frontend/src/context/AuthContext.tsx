import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { loginAPI } from '../services/authService';
import type { LoginRequestDTO } from '../dto/authDTOs';

// Función para decodificar el token (la moveremos aquí para centralizarla)
const getRolesFromToken = (token: string | null): string[] => {
    if (!token) return [];
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Roles from token:', payload.roles);
        return payload.roles || [];
    } catch (e) {
        console.error('Error decoding token:', e);
        return [];
    }
};

interface IAuthContext {
    token: string | null;
    roles: string[]; // <-- AÑADIMOS ROLES AL CONTEXTO
    login: (credentials: LoginRequestDTO) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [roles, setRoles] = useState<string[]>(getRolesFromToken(token)); // <-- INICIALIZAMOS ROLES

    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
            setRoles(getRolesFromToken(token)); // <-- ACTUALIZAMOS ROLES
        } else {
            localStorage.removeItem('authToken');
            setRoles([]); // <-- LIMPIAMOS ROLES
        }
    }, [token]);

    const login = async (credentials: LoginRequestDTO) => {
        try {
            const response = await loginAPI(credentials);
            setToken(response.token); // Esto disparará el useEffect de arriba
        } catch (error) {
            console.error("Fallo el login:", error);
            throw new Error("Credenciales inválidas");
        }
    };

    const logout = () => {
        setToken(null);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, roles, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};