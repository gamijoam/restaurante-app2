import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 1. Definimos una interfaz para las props del componente
interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode; // 2. Añadimos 'children' de tipo React.ReactNode
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
    const { isAuthenticated, roles } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Si el usuario no está autenticado, lo redirigimos al login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verificamos si alguno de los roles del usuario está en la lista de roles permitidos
    const isAuthorized = roles.some(role => allowedRoles.includes(role));

    if (!isAuthorized) {
        // Si no está autorizado, lo podríamos redirigir a una página de "No Autorizado" o al inicio.
        // Por ahora, lo redirigimos al inicio.
        return <Navigate to="/" replace />;
    }

    // 3. Si está autenticado y autorizado, renderizamos los 'children'
    return <>{children}</>;
};

export default ProtectedRoute;