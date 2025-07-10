const fs = require('fs');
const path = require('path');

// Crear un icono ICO simple (formato básico)
function createSimpleICO() {
  // Un icono ICO muy básico (16x16, 32x32, 48x48)
  const iconData = Buffer.from([
    // Header ICO
    0x00, 0x00,  // Reserved
    0x01, 0x00,  // Type (1 = ICO)
    0x03, 0x00,  // Number of images
    
    // Image 1: 16x16
    0x10, 0x00,  // Width
    0x10, 0x00,  // Height
    0x00,        // Color count
    0x00,        // Reserved
    0x01, 0x00,  // Planes
    0x20, 0x00,  // Bits per pixel
    0x40, 0x01, 0x00, 0x00,  // Size (320 bytes)
    0x16, 0x00, 0x00, 0x00,  // Offset
    
    // Image 2: 32x32
    0x20, 0x00,  // Width
    0x20, 0x00,  // Height
    0x00,        // Color count
    0x00,        // Reserved
    0x01, 0x00,  // Planes
    0x20, 0x00,  // Bits per pixel
    0x00, 0x04, 0x00, 0x00,  // Size (1024 bytes)
    0x56, 0x01, 0x00, 0x00,  // Offset
    
    // Image 3: 48x48
    0x30, 0x00,  // Width
    0x30, 0x00,  // Height
    0x00,        // Color count
    0x00,        // Reserved
    0x01, 0x00,  // Planes
    0x20, 0x00,  // Bits per pixel
    0x00, 0x09, 0x00, 0x00,  // Size (2304 bytes)
    0x56, 0x05, 0x00, 0x00,  // Offset
  ]);
  
  // Crear datos de imagen simple (gradiente azul)
  const createImageData = (size) => {
    const data = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const r = Math.floor((x / size) * 255);
        const g = Math.floor((y / size) * 255);
        const b = 255;
        data.push(b, g, r, 255); // BGRA format
      }
    }
    return Buffer.from(data);
  };
  
  // Agregar datos de imagen
  const image16 = createImageData(16);
  const image32 = createImageData(32);
  const image48 = createImageData(48);
  
  const finalIcon = Buffer.concat([iconData, image16, image32, image48]);
  
  return finalIcon;
}

// Crear el icono
const iconBuffer = createSimpleICO();
fs.writeFileSync(path.join(__dirname, 'assets', 'icon.ico'), iconBuffer);

console.log('Icono ICO creado en assets/icon.ico'); 