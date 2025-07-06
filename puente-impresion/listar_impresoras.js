// --- SCRIPT DETECTIVE DE IMPRESORAS (CORREGIDO) ---

// 1. Importamos la librería directamente
const nodePrinter = require('node-printer');

console.log("--- Detectando impresoras instaladas en el sistema ---");

try {
    // 2. Llamamos a getPrinters() directamente desde la librería importada
    const printers = nodePrinter.getPrinters();

    if (!printers || printers.length === 0) {
        console.log("No se encontraron impresoras. Asegúrate de que los drivers estén instalados.");
        return;
    }

    console.log("\nImpresoras encontradas:");
    printers.forEach((p, index) => {
        console.log(`\n--- Impresora #${index + 1} ---`);
        console.log(`Nombre Exacto: "${p.name}"`);
        console.log(`   Estado: ${p.status}`);
        console.log(`   ¿Es la predeterminada?: ${p.isDefault}`);
    });

    console.log("\nINSTRUCCIÓN: Copia el 'Nombre Exacto' de tu impresora térmica y pégalo en el archivo index.js para la prueba final.");

} catch (error) {
    console.error("Ocurrió un error al intentar obtener la lista de impresoras:", error);
}