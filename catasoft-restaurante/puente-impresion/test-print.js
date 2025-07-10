// Script de prueba para el puente de impresión
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

// Datos de prueba para ticket de CAJA (con precios)
const testCajaData = {
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

// Datos de prueba para ticket de COCINA (sin precios)
const testCocinaData = {
    comandaId: 123,
    nombreMesa: "Mesa 5",
    fechaHora: "2024-01-15 14:30:00",
    items: [
        {
            cantidad: 2,
            nombreProducto: "Hamburguesa Clásica",
            notas: "Sin cebolla"
        },
        {
            cantidad: 1,
            nombreProducto: "Coca Cola",
            notas: ""
        },
        {
            cantidad: 1,
            nombreProducto: "Papas Fritas",
            notas: "Bien doradas"
        }
    ]
};

async function imprimirTicketCaja(printer, ticketData) {
    // Encabezado del ticket de caja
    printer.alignCenter();
    printer.println("Restaurante 'El Buen Sabor'");
    printer.println("================================");
    printer.alignLeft();
    
    // Información de la mesa y comanda
    printer.println(`Mesa: ${ticketData.nombreMesa}`);
    printer.println(`Comanda #: ${ticketData.comandaId}`);
    printer.println(`Fecha: ${ticketData.fechaHora}`);
    printer.println("--------------------------------");
    
    // Tabla de items con precios
    printer.println("Cant. | Producto | Total");
    printer.println("--------------------------------");
    
    ticketData.items.forEach((item, index) => {
        const cantidad = item.cantidad.toString().padStart(3);
        const producto = item.nombreProducto.substring(0, 20).padEnd(20);
        const total = `$${item.precioTotal.toFixed(2)}`.padStart(8);
        printer.println(`${cantidad} | ${producto} | ${total}`);
    });
    
    printer.println("--------------------------------");
    printer.alignRight();
    printer.println(`TOTAL: $${ticketData.total.toFixed(2)}`);
    printer.alignCenter();
    printer.println("¡Gracias por su visita!");
    printer.println("");
    printer.cut();
}

async function imprimirTicketCocina(printer, ticketData) {
    // Encabezado del ticket de cocina
    printer.alignCenter();
    printer.println("COCINA");
    printer.println("================================");
    printer.alignLeft();
    
    // Información básica
    printer.println(`Mesa: ${ticketData.nombreMesa}`);
    printer.println(`Comanda #: ${ticketData.comandaId}`);
    printer.println(`Hora: ${ticketData.fechaHora}`);
    printer.println("--------------------------------");
    
    // Lista simple de productos para cocina
    printer.println("Cant. | Producto");
    printer.println("--------------------------------");
    
    ticketData.items.forEach((item, index) => {
        const cantidad = item.cantidad.toString().padStart(3);
        const producto = item.nombreProducto;
        printer.println(`${cantidad} x ${producto}`);
        
        // Si hay notas, las mostramos
        if (item.notas && item.notas.trim() !== "") {
            printer.println(`     Nota: ${item.notas}`);
        }
    });
    
    printer.println("--------------------------------");
    printer.alignCenter();
    printer.println("¡LISTO PARA PREPARAR!");
    printer.println("");
    printer.cut();
}

async function testPrint() {
    console.log("🧪 Iniciando pruebas de impresión...");

    // Configurar la impresora (usar configuración de prueba)
    const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'TCP:192.168.1.100:9100', // Cambiar por tu IP real
        driver: require('node-printer'),
        characterSet: 'PC850_MULTILINGUAL'
    });

    try {
        // Prueba 1: Ticket de CAJA
        console.log("\n📋 Generando ticket de CAJA...");
        await imprimirTicketCaja(printer, testCajaData);
        await printer.execute();
        console.log("✅ Ticket de CAJA completado.");
        
        // Esperar un poco entre impresiones
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Prueba 2: Ticket de COCINA
        console.log("\n📋 Generando ticket de COCINA...");
        await imprimirTicketCocina(printer, testCocinaData);
        await printer.execute();
        console.log("✅ Ticket de COCINA completado.");
        
        console.log("\n🎉 Todas las pruebas completadas exitosamente.");
        
    } catch (error) {
        console.error("❌ Error durante las pruebas de impresión:", error);
        console.log("💡 Sugerencia: Verifica que la impresora esté conectada y la IP sea correcta.");
    }
}

// Ejecutar las pruebas
testPrint().catch(console.error); 