import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { loginAPI } from '../services/authService';
import type { LoginRequestDTO } from '../dto/authDTOs';

interface IAuthContext {
    token: string | null;
    login: (credentials: LoginRequestDTO) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

    useEffect(() => {
        // Sincroniza el token con localStorage
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }, [token]);

    const login = async (credentials: LoginRequestDTO) => {
        try {
            const response = await loginAPI(credentials);
            setToken(response.token);
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
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
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