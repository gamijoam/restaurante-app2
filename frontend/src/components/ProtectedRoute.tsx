import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 1. Definimos una interfaz para las props del componente
interface ProtectedRouteProps {
    allowedRoles?: string[];
    allowedPermissions?: string[];
    children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, allowedPermissions, children }: ProtectedRouteProps) => {
    const { isAuthenticated, roles, hasPermission } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Si el usuario no está autenticado, lo redirigimos al login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verificar autorización por roles
    let isAuthorized = false;
    
    if (allowedRoles && allowedRoles.length > 0) {
        isAuthorized = roles.some(role => allowedRoles.includes(role));
    }
    
    // Verificar autorización por permisos
    if (allowedPermissions && allowedPermissions.length > 0) {
        isAuthorized = allowedPermissions.some(permission => hasPermission(permission));
    }
    
    // Si no se especificaron roles ni permisos, permitir acceso
    if (!allowedRoles && !allowedPermissions) {
        isAuthorized = true;
    }

    if (!isAuthorized) {
        // Si no está autorizado, lo redirigimos al inicio
        return <Navigate to="/" replace />;
    }

    // Si está autenticado y autorizado, renderizamos los 'children'
    return <>{children}</>;
};

export default ProtectedRoute;