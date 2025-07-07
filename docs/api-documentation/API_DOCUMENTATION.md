# Documentación de la API REST - Sistema de Gestión de Restaurantes

## 📋 Información General

- **Base URL:** `http://localhost:8080/api/v1`
- **Autenticación:** JWT Bearer Token
- **Content-Type:** `application/json`
- **Versión:** 2.0

## 🔐 Autenticación

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "roles": ["ROLE_GERENTE"],
    "permissions": ["VER_REPORTES", "EDITAR_PRODUCTOS", ...]
  }
}
```

### Verificar Sesión
```http
GET /api/auth/verificar-sesion
Authorization: Bearer <token>
```

## 👥 Usuarios

### Obtener Todos los Usuarios
```http
GET /api/v1/usuarios
Authorization: Bearer <token>
```

### Crear Usuario
```http
POST /api/v1/usuarios
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "nuevo_usuario",
  "password": "password123",
  "nombre": "Nombre Completo",
  "email": "usuario@email.com",
  "roles": ["CAMARERO"]
}
```

### Actualizar Usuario
```http
PUT /api/v1/usuarios/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Nuevo Nombre",
  "email": "nuevo@email.com"
}
```

### Eliminar Usuario
```http
DELETE /api/v1/usuarios/{id}
Authorization: Bearer <token>
```

## 🏪 Mesas

### Obtener Todas las Mesas
```http
GET /api/v1/mesas
Authorization: Bearer <token>
```

### Obtener Mapa de Mesas
```http
GET /api/v1/mesas/mapa
Authorization: Bearer <token>
```

### Crear Mesa
```http
POST /api/v1/mesas
Authorization: Bearer <token>
Content-Type: application/json

{
  "numero": 1,
  "capacidad": 4,
  "nombre": "Mesa Principal",
  "posicionX": 100,
  "posicionY": 100
}
```

### Actualizar Estado de Mesa
```http
PUT /api/v1/mesas/{id}/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "OCUPADA"
}
```

### Actualizar Posición de Mesa
```http
PUT /api/v1/mesas/{id}/posicion
Authorization: Bearer <token>
Content-Type: application/json

{
  "posicionX": 150,
  "posicionY": 200
}
```

### Eliminar Mesa
```http
DELETE /api/v1/mesas/{id}
Authorization: Bearer <token>
```

## 📦 Productos

### Obtener Todos los Productos
```http
GET /api/v1/productos
Authorization: Bearer <token>
```

### Crear Producto
```http
POST /api/v1/productos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Hamburguesa Clásica",
  "precio": 12.99,
  "descripcion": "Hamburguesa con carne, lechuga, tomate y queso",
  "categoria": "PLATO_PRINCIPAL"
}
```

### Actualizar Producto
```http
PUT /api/v1/productos/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Hamburguesa Deluxe",
  "precio": 15.99
}
```

### Eliminar Producto
```http
DELETE /api/v1/productos/{id}
Authorization: Bearer <token>
```

## 🍽️ Comandas

### Obtener Todas las Comandas
```http
GET /api/v1/comandas
Authorization: Bearer <token>
```

### Obtener Comandas por Estado
```http
GET /api/v1/comandas?estados=EN_PROCESO,LISTA
Authorization: Bearer <token>
```

### Crear Comanda
```http
POST /api/v1/comandas
Authorization: Bearer <token>
Content-Type: application/json

{
  "mesaId": 1,
  "items": [
    {
      "productoId": 1,
      "cantidad": 2
    },
    {
      "productoId": 3,
      "cantidad": 1
    }
  ]
}
```

### Actualizar Estado de Comanda
```http
PUT /api/v1/comandas/{id}/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "LISTA"
}
```

### Agregar Items a Comanda
```http
POST /api/v1/comandas/{id}/items
Authorization: Bearer <token>
Content-Type: application/json

[
  {
    "productoId": 2,
    "cantidad": 1
  }
]
```

### Limpiar Items de Comanda
```http
DELETE /api/v1/comandas/{id}/items
Authorization: Bearer <token>
```

### Obtener Ticket de Comanda
```http
GET /api/v1/comandas/{id}/ticket
Authorization: Bearer <token>
```

## 🥘 Ingredientes

### Obtener Todos los Ingredientes
```http
GET /api/v1/ingredientes
Authorization: Bearer <token>
```

### Crear Ingrediente
```http
POST /api/v1/ingredientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Carne de Res",
  "stock": 50.0,
  "unidad": "KG",
  "stockMinimo": 10.0
}
```

### Actualizar Ingrediente
```http
PUT /api/v1/ingredientes/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "stock": 45.0
}
```

### Eliminar Ingrediente
```http
DELETE /api/v1/ingredientes/{id}
Authorization: Bearer <token>
```

## 📋 Recetas

### Obtener Todas las Recetas
```http
GET /api/v1/recetas
Authorization: Bearer <token>
```

### Crear Receta
```http
POST /api/v1/recetas
Authorization: Bearer <token>
Content-Type: application/json

{
  "productoId": 1,
  "ingredientes": [
    {
      "ingredienteId": 1,
      "cantidad": 0.2
    },
    {
      "ingredienteId": 2,
      "cantidad": 0.1
    }
  ]
}
```

### Actualizar Receta
```http
PUT /api/v1/recetas/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "ingredientes": [
    {
      "ingredienteId": 1,
      "cantidad": 0.25
    }
  ]
}
```

### Eliminar Receta
```http
DELETE /api/v1/recetas/{id}
Authorization: Bearer <token>
```

## 💰 Facturas

### Obtener Todas las Facturas
```http
GET /api/v1/facturas
Authorization: Bearer <token>
```

### Obtener Facturas por Fecha
```http
GET /api/v1/facturas?fechaInicio=2025-07-01&fechaFin=2025-07-31
Authorization: Bearer <token>
```

### Descargar PDF de Factura
```http
GET /api/v1/facturas/{id}/pdf
Authorization: Bearer <token>
```

## 📊 Reportes

### Generar Reporte de Ventas
```http
GET /api/v1/reportes/ventas?fechaInicio=2025-07-01&fechaFin=2025-07-31
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "fechaInicio": "2025-07-01",
  "fechaFin": "2025-07-31",
  "numeroDeVentas": 45,
  "totalRecaudado": 1250.75,
  "productosMasVendidos": [
    {
      "productoId": 1,
      "nombreProducto": "Hamburguesa Clásica",
      "cantidadTotal": 25
    }
  ]
}
```

## 🔐 Permisos

### Obtener Todos los Permisos
```http
GET /api/v1/permisos
Authorization: Bearer <token>
```

### Asignar Permisos a Usuario
```http
POST /api/v1/permisos/usuarios/{usuarioId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "permisos": ["VER_REPORTES", "EDITAR_PRODUCTOS"]
}
```

## 🖨️ Impresoras

### Obtener Configuración de Impresoras
```http
GET /api/v1/impresoras/configuracion
Authorization: Bearer <token>
```

### Actualizar Configuración
```http
PUT /api/v1/impresoras/configuracion
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombreImpresora": "EPSON TM-T88VI",
  "puerto": "COM3",
  "velocidad": 9600
}
```

### Probar Impresora
```http
POST /api/v1/impresoras/probar
Authorization: Bearer <token>
```

## 📝 Estados y Enums

### Estados de Comanda
- `EN_PROCESO` - Comanda en preparación
- `LISTA` - Comanda lista para entregar
- `ENTREGADA` - Comanda entregada al cliente
- `PAGADA` - Comanda pagada
- `CANCELADA` - Comanda cancelada

### Estados de Mesa
- `LIBRE` - Mesa disponible
- `OCUPADA` - Mesa con clientes
- `RESERVADA` - Mesa reservada
- `MANTENIMIENTO` - Mesa en mantenimiento
- `LISTA_PARA_PAGAR` - Mesa lista para cobrar

### Categorías de Producto
- `ENTRADA` - Platos de entrada
- `PLATO_PRINCIPAL` - Platos principales
- `POSTRE` - Postres
- `BEBIDA` - Bebidas
- `ACOMPAÑAMIENTO` - Acompañamientos

### Unidades de Medida
- `KG` - Kilogramos
- `G` - Gramos
- `L` - Litros
- `ML` - Mililitros
- `UNIDAD` - Unidades

## 🚨 Códigos de Error

### 400 - Bad Request
```json
{
  "error": "Datos inválidos",
  "message": "El campo 'nombre' es requerido"
}
```

### 401 - Unauthorized
```json
{
  "error": "No autorizado",
  "message": "Token JWT inválido o expirado"
}
```

### 403 - Forbidden
```json
{
  "error": "Acceso denegado",
  "message": "No tienes permisos para acceder a este recurso"
}
```

### 404 - Not Found
```json
{
  "error": "Recurso no encontrado",
  "message": "Producto con id 123 no encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Error interno del servidor",
  "message": "Error al procesar la solicitud"
}
```

## 📡 WebSocket

### Suscripciones Disponibles

#### Actualizaciones Generales
```javascript
// Suscribirse a actualizaciones generales
stompClient.subscribe('/topic/general', function(message) {
    console.log('Actualización general:', message.body);
});
```

#### Actualizaciones de Cocina
```javascript
// Suscribirse a actualizaciones de cocina
stompClient.subscribe('/topic/cocina', function(message) {
    console.log('Nueva comanda en cocina:', message.body);
});
```

#### Actualizaciones de Caja
```javascript
// Suscribirse a actualizaciones de caja
stompClient.subscribe('/topic/caja', function(message) {
    console.log('Comanda lista para cobrar:', message.body);
});
```

#### Actualizaciones de Mesas
```javascript
// Suscribirse a actualizaciones de mesas
stompClient.subscribe('/topic/mesas', function(message) {
    console.log('Estado de mesa actualizado:', message.body);
});
```

## 🔧 Ejemplos de Uso

### Ejemplo Completo: Crear Comanda y Facturar

1. **Crear Comanda**
```http
POST /api/v1/comandas
Authorization: Bearer <token>
Content-Type: application/json

{
  "mesaId": 1,
  "items": [
    {"productoId": 1, "cantidad": 2},
    {"productoId": 3, "cantidad": 1}
  ]
}
```

2. **Cambiar Estado a Lista**
```http
PUT /api/v1/comandas/1/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "LISTA"
}
```

3. **Cambiar Estado a Entregada**
```http
PUT /api/v1/comandas/1/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "ENTREGADA"
}
```

4. **Pagar Comanda**
```http
PUT /api/v1/comandas/1/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "PAGADA"
}
```

### Ejemplo: Gestión de Inventario

1. **Ver Stock de Ingredientes**
```http
GET /api/v1/ingredientes
Authorization: Bearer <token>
```

2. **Actualizar Stock**
```http
PUT /api/v1/ingredientes/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "stock": 45.0
}
```

## 📚 Recursos Adicionales

- **Documentación de Spring Boot:** https://spring.io/projects/spring-boot
- **Documentación de React:** https://reactjs.org/docs
- **Documentación de Material-UI:** https://mui.com/material-ui/getting-started/

---

**Última actualización:** Julio 2025  
**Versión de la API:** 2.0 