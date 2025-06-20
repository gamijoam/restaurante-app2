import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Si no está autenticado, lo redirigimos a la página de login
        return <Navigate to="/login" />;
    }

    // Si está autenticado, renderizamos el componente hijo (App en nuestro caso)
    return <Outlet />;
};

export default ProtectedRoute;