import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { loginAPI } from '../services/authService';
import type { LoginRequestDTO } from '../dto/authDTOs';

// Función para decodificar el token (la moveremos aquí para centralizarla)
const getRolesFromToken = (token: string | null): string[] => {
    if (!token) return [];
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.roles || [];
    } catch (e) {
        return [];
    }
};

// Función para extraer permisos del token
const getPermisosFromToken = (token: string | null): string[] => {
    if (!token) return [];
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.permisos || [];
    } catch (e) {
        return [];
    }
};

// Función para extraer información del usuario del token
const getUserInfoFromToken = (token: string | null) => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            userId: payload.userId,
            nombre: payload.nombre,
            apellido: payload.apellido
        };
    } catch (e) {
        return null;
    }
};

interface IAuthContext {
    token: string | null;
    roles: string[];
    permisos: string[];
    userInfo: { userId: number; nombre: string; apellido: string } | null;
    login: (credentials: LoginRequestDTO) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [roles, setRoles] = useState<string[]>(getRolesFromToken(token));
    const [permisos, setPermisos] = useState<string[]>(getPermisosFromToken(token));
    const [userInfo, setUserInfo] = useState(getUserInfoFromToken(token));

    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
            setRoles(getRolesFromToken(token));
            setPermisos(getPermisosFromToken(token));
            setUserInfo(getUserInfoFromToken(token));
        } else {
            localStorage.removeItem('authToken');
            setRoles([]);
            setPermisos([]);
            setUserInfo(null);
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

    const hasPermission = (permission: string): boolean => {
        return permisos.includes(permission);
    };

    return (
        <AuthContext.Provider value={{ 
            token, 
            roles, 
            permisos, 
            userInfo, 
            login, 
            logout, 
            isAuthenticated, 
            hasPermission 
        }}>
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