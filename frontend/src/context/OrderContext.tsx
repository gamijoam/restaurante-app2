import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import type { Producto, ComandaResponseDTO } from '../types';
import { crearComandaAPI, agregarItemsAComandaAPI, updateComandaEstado } from '../services/comandaService';
import type { ItemRequestDTO } from '../dto/comandaDTOs';

// --- INTERFAZ UNIFICADA Y FINAL ---
interface IOrderContext {
    orderItems: OrderItem[];
    activeComandaId: number | null;
    addProductToOrder: (product: Producto) => Promise<void>;
    submitNewOrder: (mesaId: number) => Promise<void>;
    loadExistingOrder: (comanda: ComandaResponseDTO) => void;
    clearOrder: () => void;
    cancelOrder: (comandaId: number) => Promise<void>; // Función para cancelar
}

interface OrderItem {
    productoId: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
}

// --- EXPORTAMOS EL CONTEXTO ---
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
            setOrderItems(currentItems => {
                const existingItem = currentItems.find(item => item.productoId === productToAdd.id);
                if (existingItem) {
                    return currentItems.map(item =>
                        item.productoId === productToAdd.id
                            ? { ...item, cantidad: item.cantidad + 1 }
                            : item
                    );
                }
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

    const cancelOrder = useCallback(async (comandaId: number) => {
        try {
            await updateComandaEstado(comandaId, 'CANCELADA');
            clearOrder();
            alert('Comanda cancelada con éxito.');
        } catch (error) {
            console.error("Error al cancelar la comanda:", error);
            alert('Hubo un error al cancelar la comanda.');
        }
    }, [clearOrder]);


    return (
        <OrderContext.Provider value={{ orderItems, activeComandaId, addProductToOrder, submitNewOrder, loadExistingOrder, clearOrder, cancelOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

// La función useOrder vive en su propio archivo /src/hooks/useOrder.ts