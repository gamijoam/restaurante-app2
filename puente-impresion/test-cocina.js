// Script de prueba para tickets de cocina
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

// Datos de prueba para ticket de cocina (sin precios)
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
        },
        {
            cantidad: 1,
            nombreProducto: "Ensalada César",
            notas: "Sin crutones"
        }
    ]
};

async function testCocinaPrint() {
    console.log("🧪 Iniciando prueba de impresión para COCINA...");
    console.log("Datos de prueba:", JSON.stringify(testCocinaData, null, 2));

    // Configurar la impresora (usar configuración de prueba)
    const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'TCP:192.168.1.100:9100', // Cambiar por tu IP real
        driver: require('node-printer'),
        characterSet: 'PC850_MULTILINGUAL'
    });

    try {
        console.log("📋 Generando ticket de cocina...");
        
        // Encabezado del ticket de cocina
        printer.alignCenter();
        printer.println("COCINA");
        printer.println("================================");
        printer.alignLeft();
        
        // Información básica
        printer.println(`Mesa: ${testCocinaData.nombreMesa}`);
        printer.println(`Comanda #: ${testCocinaData.comandaId}`);
        printer.println(`Hora: ${testCocinaData.fechaHora}`);
        printer.println("--------------------------------");
        
        // Lista simple de productos para cocina
        printer.println("Cant. | Producto");
        printer.println("--------------------------------");
        
        testCocinaData.items.forEach((item, index) => {
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
        
        console.log("🖨️ Enviando ticket de cocina a impresora...");
        await printer.execute();
        console.log("✅ Prueba de impresión de cocina completada exitosamente.");
        
    } catch (error) {
        console.error("❌ Error durante la prueba de impresión de cocina:", error);
        console.log("💡 Sugerencia: Verifica que la impresora esté conectada y la IP sea correcta.");
    }
}

// Ejecutar la prueba
testCocinaPrint().catch(console.error); 