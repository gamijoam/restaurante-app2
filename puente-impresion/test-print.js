// Script de prueba para el puente de impresión
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

// Datos de prueba que simulan lo que debería recibir del backend
const testTicketData = {
    comandaId: 123,
    nombreMesa: "Mesa 5",
    fechaHora: "2024-01-15 14:30:00",
    items: [
        {
            cantidad: 2,
            nombreProducto: "Hamburguesa Clásica",
            precioUnitario: 12.50,
            precioTotal: 25.00
        },
        {
            cantidad: 1,
            nombreProducto: "Coca Cola",
            precioUnitario: 3.00,
            precioTotal: 3.00
        },
        {
            cantidad: 1,
            nombreProducto: "Papas Fritas",
            precioUnitario: 4.50,
            precioTotal: 4.50
        }
    ],
    total: 32.50
};

async function testPrint() {
    console.log("🧪 Iniciando prueba de impresión...");
    console.log("Datos de prueba:", JSON.stringify(testTicketData, null, 2));

    // Configurar la impresora (usar configuración de prueba)
    const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'TCP:192.168.1.100:9100', // Cambiar por tu IP real
        driver: require('node-printer'),
        characterSet: 'PC850_MULTILINGUAL'
    });

    try {
        console.log("📋 Generando ticket de prueba...");
        
        // Encabezado del ticket
        printer.alignCenter();
        printer.println("Restaurante 'El Buen Sabor'");
        printer.println("================================");
        printer.alignLeft();
        
        // Información de la mesa y comanda
        printer.println(`Mesa: ${testTicketData.nombreMesa}`);
        printer.println(`Comanda #: ${testTicketData.comandaId}`);
        printer.println(`Fecha: ${testTicketData.fechaHora}`);
        printer.println("--------------------------------");
        
        // Tabla de items
        printer.println("Cant. | Producto | Total");
        printer.println("--------------------------------");
        
        testTicketData.items.forEach((item, index) => {
            const cantidad = item.cantidad.toString().padStart(3);
            const producto = item.nombreProducto.substring(0, 20).padEnd(20);
            const total = `$${item.precioTotal.toFixed(2)}`.padStart(8);
            printer.println(`${cantidad} | ${producto} | ${total}`);
        });
        
        printer.println("--------------------------------");
        printer.alignRight();
        printer.println(`TOTAL: $${testTicketData.total.toFixed(2)}`);
        printer.alignCenter();
        printer.println("¡Gracias por su visita!");
        printer.println("");
        printer.cut();
        
        console.log("🖨️ Enviando a impresora...");
        await printer.execute();
        console.log("✅ Prueba de impresión completada exitosamente.");
        
    } catch (error) {
        console.error("❌ Error durante la prueba de impresión:", error);
        console.log("💡 Sugerencia: Verifica que la impresora esté conectada y la IP sea correcta.");
    }
}

// Ejecutar la prueba
testPrint().catch(console.error); 