import React from 'react';
import type { TicketData } from '../services/comandaService';
import './TicketParaImprimir.css'; // Crearemos este CSS a continuación

interface Props {
    ticketData: TicketData | null;
}

// Usamos React.forwardRef para poder obtener una referencia al div desde el componente padre
const TicketParaImprimir = React.forwardRef<HTMLDivElement, Props>(({ ticketData }, ref) => {
    if (!ticketData) {
        return null; // No renderiza nada si no hay datos
    }

    return (
        <div className="ticket-container" ref={ref}>
            <div className="ticket-content">
                <h3>Restaurante "El Buen Sabor"</h3>
                <p><strong>Mesa:</strong> {ticketData.nombreMesa}</p>
                <p><strong>Fecha:</strong> {new Date(ticketData.fechaHora).toLocaleString()}</p>
                <hr />
                <table>
                    <thead>
                        <tr>
                            <th>Cant.</th>
                            <th>Producto</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ticketData.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.cantidad}</td>
                                <td>{item.nombreProducto}</td>
                                <td>${item.precioTotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <hr />
                <p className="total"><strong>TOTAL: ${ticketData.total.toFixed(2)}</strong></p>
                <p className="gracias">¡Gracias por su visita!</p>
            </div>
        </div>
    );
});

export default TicketParaImprimir;