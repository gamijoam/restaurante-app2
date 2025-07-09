# INSTRUCCIONES DE INSTALACIÓN Y USO DEL SISTEMA

## Estructura de carpetas entregada

```
mi-app/
  launcher.exe                # Programa principal para iniciar todo el sistema
  backend/
    backend.jar               # Servicio principal (Java)
    application.properties    # Configuración del backend
  license-service/
    license-service.jar       # Microservicio de licencias (Java)
    application.yml           # Configuración del microservicio
  puente-impresion/
    puente-impresion.exe      # Servicio de impresión (Node.js empaquetado)
    config.json               # Configuración de impresoras
  frontend/
    dist/                     # Archivos del sistema web (React)
      index.html
      assets/
      ...
  jre/                        # Java portable (si el cliente no tiene Java instalado)
  node/                       # Node.js portable (si el cliente no tiene Node instalado)
  README-ENTREGA.txt          # Este archivo
```

## ¿Cómo usar el sistema?

1. **No mueva ni borre ninguna carpeta ni archivo.**
2. **Haga doble click en `launcher.exe`.**
   - El sistema iniciará automáticamente todos los servicios necesarios.
   - Espere unos segundos hasta que vea el mensaje "Sistema iniciado".
3. **Abra su navegador y vaya a:**
   - [http://localhost:5173](http://localhost:5173) (o la dirección indicada por el instalador)
4. **Para detener el sistema:**
   - Cierre la ventana del launcher o use el botón "Detener todo" si está disponible.

## ¿Qué hace cada carpeta?
- **backend/**: Servicio principal de la aplicación (Java)
- **license-service/**: Microservicio de licencias (Java)
- **puente-impresion/**: Servicio de impresión para tickets (Node.js)
- **frontend/dist/**: Archivos del sistema web (no necesita abrirlos manualmente)
- **jre/**: Java portable (solo si no tiene Java instalado)
- **node/**: Node.js portable (solo si no tiene Node instalado)

## Soporte
Si tiene algún problema, no dude en contactar a:
- **Soporte técnico:** [tu-email@dominio.com]
- **Teléfono:** [tu-número]

---
**¡Gracias por confiar en nuestro sistema!** 