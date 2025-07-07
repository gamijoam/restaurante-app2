import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import type { Producto, ComandaResponseDTO } from '../types';
import { crearComandaAPI, agregarItemsAComanda, updateComandaEstado, limpiarItemsComandaAPI } from '../services/comandaService';
import type { ItemRequestDTO } from '../dto/ItemRequestDTO';
import type { ComandaItemResponseDTO } from '../dto/comandaDTOs';

// --- INTERFAZ UNIFICADA Y FINAL ---
interface IOrderContext {
    orderItems: OrderItem[];
    activeComandaId: number | null;
    addProductToOrder: (product: Producto, itemPrincipalId?: number, cantidad?: number) => Promise<void>;
    updateItemQuantity: (productoId: number, cantidad: number, itemPrincipalId?: number) => void;
    removeItemFromOrder: (productoId: number, itemPrincipalId?: number) => void;
    submitNewOrder: (mesaId: number) => Promise<void>;
    loadExistingOrder: (comanda: ComandaResponseDTO) => void;
    clearOrder: () => void;
    cancelOrder: (comandaId: number) => Promise<void>; // Función para cancelar
    limpiarComanda: () => Promise<void>; // Nueva función
}

interface OrderItem {
    productoId: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    itemPrincipalId?: number; // Opcional, si es adicional de otro item
}

// --- EXPORTAMOS EL CONTEXTO ---
export const OrderContext = createContext<IOrderContext | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [activeComandaId, setActiveComandaId] = useState<number | null>(null);

    const loadExistingOrder = useCallback((comanda: ComandaResponseDTO) => {
        setActiveComandaId(comanda.id);
        setOrderItems(comanda.items.map((item: any) => ({
            productoId: item.productoId,
            productoNombre: item.productoNombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            itemPrincipalId: item.itemPrincipalId ?? undefined
        })));
    }, []);

    const clearOrder = useCallback(() => {
        setOrderItems([]);
        setActiveComandaId(null);
    }, []);

    const addProductToOrder = useCallback(async (productToAdd: Producto, itemPrincipalId?: number, cantidad: number = 1) => {
        if (activeComandaId) {
            const newItem: ItemRequestDTO = { productoId: productToAdd.id, cantidad };
            if (itemPrincipalId) newItem.itemPrincipalId = itemPrincipalId;
            try {
                const response = await agregarItemsAComanda(activeComandaId, [newItem]);
                loadExistingOrder(response.data);
            } catch (error) {
                console.error("Error al añadir item:", error);
                alert("Error al añadir el producto a la comanda.");
            }
        } else {
            setOrderItems(currentItems => {
                const existingItem = currentItems.find(item => item.productoId === productToAdd.id && item.itemPrincipalId === itemPrincipalId);
                if (existingItem) {
                    return currentItems.map(item =>
                        item.productoId === productToAdd.id && item.itemPrincipalId === itemPrincipalId
                            ? { ...item, cantidad: item.cantidad + cantidad }
                            : item
                    );
                }
                return [...currentItems, {
                    productoId: productToAdd.id,
                    productoNombre: productToAdd.nombre,
                    cantidad,
                    precioUnitario: productToAdd.precio,
                    itemPrincipalId: itemPrincipalId
                }];
            });
        }
    }, [activeComandaId, loadExistingOrder]);

    const updateItemQuantity = useCallback((productoId: number, cantidad: number, itemPrincipalId?: number) => {
        if (activeComandaId) return; // Solo permitido antes de crear la comanda
        setOrderItems(currentItems =>
            currentItems.map(item =>
                item.productoId === productoId && item.itemPrincipalId === itemPrincipalId
                    ? { ...item, cantidad: Math.max(1, cantidad) }
                    : item
            )
        );
    }, [activeComandaId]);

    const removeItemFromOrder = useCallback((productoId: number, itemPrincipalId?: number) => {
        if (activeComandaId) return; // Solo permitido antes de crear la comanda
        setOrderItems(currentItems =>
            currentItems.filter(item =>
                !(item.productoId === productoId && item.itemPrincipalId === itemPrincipalId)
            )
        );
    }, [activeComandaId]);

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

    const limpiarComanda = useCallback(async () => {
        if (!activeComandaId) return;
        try {
            await limpiarItemsComandaAPI(activeComandaId);
            setOrderItems([]);
            alert('Comanda vaciada correctamente.');
        } catch (error) {
            console.error('Error al limpiar la comanda:', error);
            alert('Hubo un error al limpiar la comanda.');
        }
    }, [activeComandaId]);


    return (
        <OrderContext.Provider value={{ orderItems, activeComandaId, addProductToOrder, updateItemQuantity, removeItemFromOrder, submitNewOrder, loadExistingOrder, clearOrder, cancelOrder, limpiarComanda }}>
            {children}
        </OrderContext.Provider>
    );
};

// La función useOrder vive en su propio archivo /src/hooks/useOrder.ts