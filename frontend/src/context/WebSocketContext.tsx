// ⚠️ Este archivo está deprecado. Usa WebSocketContextProduction.tsx para producción.
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Client } from '@stomp/stompjs';

interface IWebSocketContext {
    stompClient: Client | null;
    isConnected: boolean;
    reconnect: () => void;
}

const WebSocketContext = createContext<IWebSocketContext | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 3; // Reducir intentos

    const cleanup = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    };

    const reconnect = () => {
        console.log('🔄 Reconexión manual iniciada...');
        cleanup();
        reconnectAttemptsRef.current = 0;
        initializeWebSocket();
    };

    const initializeWebSocket = () => {
        console.log("🔄 Iniciando conexión WebSocket...");
        
        // Limpiar recursos anteriores
        cleanup();
        
        const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
        const wsURL = baseURL.replace(/^http/, 'ws') + '/ws';

        const client = new Client({
            brokerURL: wsURL,
            reconnectDelay: 3000, // Reducir delay
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        client.onConnect = () => {
            console.log("✅ WebSocket conectado");
            setIsConnected(true);
            reconnectAttemptsRef.current = 0;
        };

        client.onDisconnect = () => {
            console.log("❌ WebSocket desconectado");
            setIsConnected(false);
        };

        client.onStompError = (frame) => {
            console.error('❌ Error STOMP:', frame.headers['message']);
            setIsConnected(false);
            
            // Reconexión automática limitada
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                reconnectAttemptsRef.current++;
                console.log(`🔄 Reconexión automática ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    client.activate();
                }, 3000);
            }
        };

        client.onWebSocketError = (error) => {
            console.error('❌ Error WebSocket:', error);
            setIsConnected(false);
            
            // Reconexión automática limitada
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                reconnectAttemptsRef.current++;
                console.log(`🔄 Reconexión automática ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    client.activate();
                }, 3000);
            }
        };

        client.onWebSocketClose = () => {
            console.log('❌ WebSocket cerrado');
            setIsConnected(false);
        };

        try {
            client.activate();
            setStompClient(client);
        } catch (error) {
            console.error('❌ Error activando WebSocket:', error);
            setIsConnected(false);
        }
    };

    useEffect(() => {
        initializeWebSocket();

        return () => {
            cleanup();
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, []);

    const value: IWebSocketContext = {
        stompClient,
        isConnected,
        reconnect
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

// DEPRECATED: Exportaciones solo para compatibilidad, no usar en producción
export const DeprecatedWebSocketProvider = WebSocketProvider;
export const deprecatedUseWebSocket = useWebSocket;