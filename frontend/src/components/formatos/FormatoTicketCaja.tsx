import React from 'react';
import type { TicketData } from '../../services/comandaService';
import './FormatoTicketCaja.css'; // Usaremos un CSS dedicado

interface Props {
    ticketData: TicketData;
}

// Este componente es el "molde" visual de tu ticket.
// Lo pasamos dentro de un forwardRef para que la librería de impresión pueda acceder a él.
const FormatoTicketCaja = React.forwardRef<HTMLDivElement, Props>(({ ticketData }, ref) => {
    return (
        // El ref se adjunta aquí
        <div ref={ref} className="ticket-wrapper">
            <h3>Restaurante "El Buen Sabor"</h3>
            <p><strong>Mesa:</strong> {ticketData.nombreMesa}</p>
            <p><strong>Fecha:</strong> {new Date(ticketData.fechaHora).toLocaleString()}</p>
            <p><strong>Comanda #:</strong> {ticketData.comandaId}</p>
            <hr />
            <table>
                <thead>
                    <tr>
                        <th>Cant.</th>
                        <th>Producto</th>
                        <th className="precio">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketData.items.map((item, index) => (
                        <tr key={index}>
                            <td>{item.cantidad}</td>
                            <td>{item.nombreProducto}</td>
                            <td className="precio">${item.precioTotal.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr />
            <p className="total"><strong>TOTAL: ${ticketData.total.toFixed(2)}</strong></p>
            <hr />
            <p className="gracias">¡Gracias por su visita!</p>
        </div>
    );
});

export default FormatoTicketCaja;