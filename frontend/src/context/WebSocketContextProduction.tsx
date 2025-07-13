// ✅ Este es el único WebSocketContext que debe usarse en producción y desarrollo.
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
    const maxReconnectAttempts = 3; // Reducir intentos para evitar bucles
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const isInitializedRef = useRef(false);
    const isShuttingDownRef = useRef(false);

    const cleanup = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    };

    const reconnect = () => {
        if (isShuttingDownRef.current) return;
        
        console.log('🔄 Reconexión manual iniciada...');
        cleanup();
        reconnectAttemptsRef.current = 0;
        initializeWebSocket();
    };

    const initializeWebSocket = () => {
        if (isShuttingDownRef.current) return;
        
        console.log("🔄 Iniciando conexión WebSocket...");
        
        // Limpiar recursos anteriores
        cleanup();
        
        // Si ya hay un cliente activo, desconectarlo primero
        if (stompClient && stompClient.connected) {
            console.log("🔄 Desconectando cliente anterior...");
            try {
                stompClient.deactivate();
            } catch (error) {
                console.log("⚠️ Error desconectando cliente anterior:", error);
            }
        }
        
        const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
        const wsURL = baseURL.replace(/^http/, 'ws') + '/ws';

        console.log("🔗 URL WebSocket:", wsURL);

        const client = new Client({
            brokerURL: wsURL,
            reconnectDelay: isProduction ? 5000 : 3000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectionTimeout: 10000, // 10 segundos timeout
        });

        client.onConnect = () => {
            if (isShuttingDownRef.current) return;
            
            console.log("✅ WebSocket conectado");
            setIsConnected(true);
            reconnectAttemptsRef.current = 0;
            isInitializedRef.current = true;
        };

        client.onDisconnect = () => {
            if (isShuttingDownRef.current) return;
            
            console.log("❌ WebSocket desconectado");
            setIsConnected(false);
            
            // Solo reintentar si no estamos cerrando la aplicación
            if (!isShuttingDownRef.current && !isInitializedRef.current) {
                console.log("🔄 Primera conexión fallida, reintentando...");
                setTimeout(() => {
                    if (!isConnected && !isShuttingDownRef.current) {
                        initializeWebSocket();
                    }
                }, 2000);
            }
        };

        client.onStompError = (frame) => {
            if (isShuttingDownRef.current) return;
            
            console.error('❌ Error STOMP:', frame.headers['message']);
            setIsConnected(false);
            
            // Reconexión automática limitada
            if (reconnectAttemptsRef.current < maxReconnectAttempts && !isShuttingDownRef.current) {
                reconnectAttemptsRef.current++;
                console.log(`🔄 Reconexión automática ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (!isConnected && !isShuttingDownRef.current) {
                        client.activate();
                    }
                }, isProduction ? 5000 : 3000);
            } else {
                console.log("⚠️ Máximo de intentos de reconexión alcanzado - WebSocket deshabilitado");
                // No intentar más reconexiones
            }
        };

        client.onWebSocketError = (error) => {
            if (isShuttingDownRef.current) return;
            
            console.error('❌ Error WebSocket:', error);
            setIsConnected(false);
            
            // Reconexión automática limitada
            if (reconnectAttemptsRef.current < maxReconnectAttempts && !isShuttingDownRef.current) {
                reconnectAttemptsRef.current++;
                console.log(`🔄 Reconexión automática ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (!isConnected && !isShuttingDownRef.current) {
                        client.activate();
                    }
                }, isProduction ? 5000 : 3000);
            } else {
                console.log("⚠️ Máximo de intentos de reconexión alcanzado - WebSocket deshabilitado");
                // No intentar más reconexiones
            }
        };

        client.onWebSocketClose = () => {
            if (isShuttingDownRef.current) return;
            
            console.log('❌ WebSocket cerrado');
            setIsConnected(false);
        };

        try {
            client.activate();
            setStompClient(client);
        } catch (error) {
            console.error('❌ Error activando WebSocket:', error);
            setIsConnected(false);
            
            // Reintento después de error de activación
            if (!isShuttingDownRef.current) {
                setTimeout(() => {
                    if (!isConnected && !isShuttingDownRef.current) {
                        console.log("🔄 Reintentando activación...");
                        initializeWebSocket();
                    }
                }, 2000);
            }
        }
    };

    useEffect(() => {
        console.log("🚀 Inicializando WebSocketContext de producción...");
        isInitializedRef.current = false;
        isShuttingDownRef.current = false;
        initializeWebSocket();

        return () => {
            console.log("🧹 Limpiando WebSocketContext...");
            isShuttingDownRef.current = true;
            cleanup();
            if (stompClient) {
                try {
                    stompClient.deactivate();
                } catch (error) {
                    console.log("⚠️ Error desconectando WebSocket:", error);
                }
            }
        };
    }, []);

    // Health check para reconexión automática (solo si no se ha alcanzado el máximo de intentos)
    useEffect(() => {
        const healthCheckInterval = setInterval(() => {
            if (!isConnected && !isInitializedRef.current && !isShuttingDownRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
                console.log("🔄 Health check: WebSocket desconectado, intentando reconectar...");
                reconnectAttemptsRef.current = 0;
                initializeWebSocket();
            }
        }, 30000); // Verificar cada 30 segundos en lugar de 10

        return () => {
            clearInterval(healthCheckInterval);
        };
    }, [isConnected]);

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

export const useWebSocket = (): IWebSocketContext => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}; 