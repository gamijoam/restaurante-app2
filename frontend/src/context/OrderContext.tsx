import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import type { Producto, ComandaResponseDTO } from '../types';
import { crearComandaAPI, agregarItemsAComandaAPI } from '../services/comandaService';
import type { ItemRequestDTO } from '../dto/comandaDTOs';

interface OrderItem {
    productoId: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
}

interface IOrderContext {
    orderItems: OrderItem[];
    activeComandaId: number | null;
    addProductToOrder: (product: Producto) => Promise<void>;
    submitNewOrder: (mesaId: number) => Promise<void>;
    loadExistingOrder: (comanda: ComandaResponseDTO) => void;
    clearOrder: () => void;
}

export const OrderContext = createContext<IOrderContext | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [activeComandaId, setActiveComandaId] = useState<number | null>(null);

    const loadExistingOrder = useCallback((comanda: ComandaResponseDTO) => {
        setActiveComandaId(comanda.id);
        setOrderItems(comanda.items.map(item => ({
            productoId: item.productoId,
            productoNombre: item.productoNombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario
        })));
    }, []);

    const clearOrder = useCallback(() => {
        setOrderItems([]);
        setActiveComandaId(null);
    }, []);

    const addProductToOrder = useCallback(async (productToAdd: Producto) => {
        if (activeComandaId) {
            const newItem: ItemRequestDTO = { productoId: productToAdd.id, cantidad: 1 };
            try {
                const comandaActualizada = await agregarItemsAComandaAPI(activeComandaId, [newItem]);
                loadExistingOrder(comandaActualizada);
            } catch (error) {
                console.error("Error al añadir item:", error);
                alert("Error al añadir el producto a la comanda.");
            }
        } else {
            // ESTA LÓGICA PREVIENE LOS DUPLICADOS
            setOrderItems(currentItems => {
                const existingItem = currentItems.find(item => item.productoId === productToAdd.id);
                if (existingItem) {
                    // Si el item existe, solo incrementa la cantidad
                    return currentItems.map(item =>
                        item.productoId === productToAdd.id
                            ? { ...item, cantidad: item.cantidad + 1 }
                            : item
                    );
                }
                // Si no existe, lo añade a la lista
                return [...currentItems, { 
                    productoId: productToAdd.id,
                    productoNombre: productToAdd.nombre,
                    cantidad: 1,
                    precioUnitario: productToAdd.precio
                }];
            });
        }
    }, [activeComandaId, loadExistingOrder]);

    const submitNewOrder = useCallback(async (mesaId: number) => {
        if (orderItems.length === 0 || activeComandaId !== null) return;
        const comandaDTO = {
            mesaId,
            items: orderItems.map(item => ({
                productoId: item.productoId,
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
    }, [orderItems, activeComandaId, clearOrder]);

    return (
        <OrderContext.Provider value={{ orderItems, activeComandaId, addProductToOrder, submitNewOrder, loadExistingOrder, clearOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};