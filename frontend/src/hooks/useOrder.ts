import { useContext } from 'react';
import { OrderContext } from '../context/OrderContext'; // Importamos el contexto

// Creamos un "hook" personalizado para consumir el contexto fácilmente
export const useOrder = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};