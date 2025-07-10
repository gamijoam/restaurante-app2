import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Client } from '@stomp/stompjs';

interface IWebSocketContext {
    stompClient: Client | null;
    isConnected: boolean;
}

const WebSocketContext = createContext<IWebSocketContext | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log("Intentando conectar WebSocket...");
        const wsURL = import.meta.env.VITE_API_URL.replace(/^http/, 'ws') + '/ws';

        const client = new Client({
            // ESTA LÍNEA ES LA MÁS IMPORTANTE
            // Se conecta directamente al endpoint que nuestro backend acaba de activar.
            // Usa 'ws' (WebSocket) en lugar de 'http'.
            brokerURL: wsURL,

            onConnect: () => {
                console.log("¡CONEXIÓN WEBSOCKET EXITOSA! CONECTADO.");
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log("Desconectado del servidor de WebSockets.");
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('Error de STOMP: ' + frame.headers['message']);
                console.error('Detalles: ' + frame.body);
            },
            reconnectDelay: 5000,
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, []); // El array vacío asegura que esto solo se ejecute una vez

    return (
        <WebSocketContext.Provider value={{ stompClient, isConnected }}>
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