import { createContext, useState, type ReactNode } from 'react';
import type { Producto } from '../types';
import { crearComandaAPI } from '../services/comandaService_OLD';

// ... (El resto de las interfaces no cambia) ...
interface OrderItem extends Producto {
    cantidad: number;
}
interface IOrderContext {
    orderItems: OrderItem[];
    addProductToOrder: (product: Producto) => void;
    submitOrder: (mesaId: number) => Promise<void>;
    clearOrder: () => void;
}
export const OrderContext = createContext<IOrderContext | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    const addProductToOrder = (productToAdd: Producto) => {
        setOrderItems(currentItems => {
            const existingItem = currentItems.find(item => item.id === productToAdd.id);
            if (existingItem) {
                return currentItems.map(item =>
                    item.id === productToAdd.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...currentItems, { ...productToAdd, cantidad: 1 }];
        });
    };

    const clearOrder = () => {
        setOrderItems([]);
    };

    const submitOrder = async (mesaId: number) => {
        // ----- LOG NÚMERO 2 -----
        console.log("2. Función submitOrder en Context llamada. Preparando DTO...");

        if (orderItems.length === 0) {
            console.log("No hay items, la ejecución de submitOrder termina aquí.");
            return;
        };

        const comandaDTO = {
            mesaId: mesaId,
            items: orderItems.map(item => ({
                productoId: item.id,
                cantidad: item.cantidad
            }))
        };
        try {
            await crearComandaAPI(comandaDTO);
            clearOrder();
            alert('¡Comanda creada con éxito!');
        } catch (error) {
            console.error("Error al crear la comanda:", error);
            alert('Hubo un error al crear la comanda.');
        }
    };

    return (
        <OrderContext.Provider value={{ orderItems, addProductToOrder, submitOrder, clearOrder }}>
            {children}
        </OrderContext.Provider>
    );
};