# Manual de Usuario - Sistema de Gestión de Restaurantes

## 📖 Índice

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Roles y Permisos](#roles-y-permisos)
4. [Manual del Gerente](#manual-del-gerente)
5. [Manual del Camarero](#manual-del-camarero)
6. [Manual del Cocinero](#manual-del-cocinero)
7. [Funcionalidades Comunes](#funcionalidades-comunes)
8. [Solución de Problemas](#solución-de-problemas)

---

## 🏠 Introducción

El Sistema de Gestión de Restaurantes es una aplicación web que permite gestionar todas las operaciones de un restaurante de manera digital, desde la toma de pedidos hasta el análisis de ventas.

### Características Principales
- ✅ **Gestión de comandas** digital
- ✅ **Control de inventario** automático
- ✅ **Facturación** y reportes
- ✅ **Gestión de mesas** visual
- ✅ **Sistema de permisos** granular

---

## 🔐 Acceso al Sistema

### Usuarios por Defecto

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `admin` | `admin123` | Gerente | Acceso completo al sistema |
| `cocina` | `cocina123` | Cocinero | Acceso a cocina e inventario |

### Pasos para Iniciar Sesión

1. **Abrir el navegador** y dirigirse a `http://localhost:5173`
2. **Hacer clic** en "Iniciar Sesión"
3. **Ingresar** usuario y contraseña
4. **Hacer clic** en "Iniciar Sesión"

---

## 👥 Roles y Permisos

### 🔴 **GERENTE** (ROLE_GERENTE)
**Usuario:** admin/admin123

**Permisos completos:**
- ✅ Ver reportes de ventas
- ✅ Gestionar productos
- ✅ Crear y gestionar usuarios
- ✅ Gestionar mesas
- ✅ Ver facturación
- ✅ Gestionar ingredientes y recetas
- ✅ Gestionar roles y permisos
- ✅ Tomar pedidos
- ✅ Ver cocina y caja
- ✅ Configurar impresoras

### 🟡 **CAMARERO** (ROLE_CAMARERO)
**Permisos específicos:**
- ✅ Tomar pedidos
- ✅ Gestionar mesas
- ✅ Ver cocina
- ✅ Ver caja
- ✅ Gestionar productos

### 🟢 **COCINERO** (ROLE_COCINERO)
**Permisos específicos:**
- ✅ Ver cocina
- ✅ Cambiar estados de comandas
- ✅ Gestionar ingredientes
- ✅ Gestionar recetas

---

## 👨‍💼 Manual del Gerente

### 📊 **Reportes de Ventas**

#### Generar Reporte
1. **Iniciar sesión** como admin
2. **Ir a** "Reportes" en el menú
3. **Seleccionar** fecha de inicio y fin
4. **Hacer clic** en "Generar Reporte"
5. **Revisar** los resultados:
   - Total recaudado
   - Número de ventas
   - Productos más vendidos

### 👥 **Gestión de Usuarios**

#### Crear Nuevo Usuario
1. **Ir a** "Usuarios" en el menú
2. **Hacer clic** en "Crear Usuario"
3. **Completar** el formulario:
   - Username (único)
   - Contraseña
   - Nombre completo
   - Email
   - Roles (CAMARERO, COCINERO, GERENTE)
4. **Hacer clic** en "Crear"

#### Gestionar Permisos
1. **Ir a** "Roles y Permisos" en el menú
2. **Seleccionar** un usuario de la lista
3. **Marcar/desmarcar** permisos según necesidad
4. **Hacer clic** en "Guardar Cambios"

### 🏪 **Gestión de Mesas**

#### Crear Nueva Mesa
1. **Ir a** "Gestión de Mesas"
2. **Hacer clic** en "Crear Mesa"
3. **Completar** datos:
   - Número de mesa
   - Capacidad
   - Nombre (opcional)
   - Posición X, Y
4. **Hacer clic** en "Crear"

#### Configurar Mapa de Mesas
1. **Ir a** "Mapa de Mesas"
2. **Arrastrar** mesas a la posición deseada
3. **Hacer doble clic** para editar
4. **Guardar** cambios

### 📦 **Gestión de Productos**

#### Agregar Producto
1. **Ir a** "Productos" en el menú
2. **Hacer clic** en "Agregar Producto"
3. **Completar** información:
   - Nombre del producto
   - Precio
   - Categoría
   - Descripción
4. **Hacer clic** en "Guardar"

### 🥘 **Gestión de Recetas**

#### Crear Receta
1. **Ir a** "Recetas" en el menú
2. **Hacer clic** en "Nueva Receta"
3. **Seleccionar** producto
4. **Agregar** ingredientes y cantidades
5. **Guardar** receta

---

## 🍽️ Manual del Camarero

### 📝 **Toma de Pedidos**

#### Crear Nueva Comanda
1. **Ir a** "Toma de Pedidos"
2. **Seleccionar** mesa disponible
3. **Hacer clic** en "Nueva Comanda"
4. **Agregar** productos:
   - Buscar producto
   - Seleccionar cantidad
   - Agregar al pedido
5. **Revisar** total
6. **Hacer clic** en "Crear Comanda"

#### Gestionar Comanda Existente
1. **Seleccionar** comanda de la lista
2. **Agregar** productos adicionales
3. **Eliminar** productos si es necesario
4. **Guardar** cambios

### 🏪 **Gestión de Mesas**

#### Ver Estado de Mesas
1. **Ir a** "Mapa de Mesas"
2. **Revisar** colores de mesas:
   - 🟢 Verde: Libre
   - 🟡 Amarillo: Ocupada
   - 🔴 Rojo: Lista para pagar
   - 🔵 Azul: Reservada

#### Cambiar Estado de Mesa
1. **Hacer clic** en mesa
2. **Seleccionar** nuevo estado
3. **Confirmar** cambio

### 💰 **Facturación**

#### Cobrar Comanda
1. **Ir a** "Caja"
2. **Seleccionar** comanda lista para pagar
3. **Revisar** total e impuestos
4. **Hacer clic** en "Cobrar"
5. **Seleccionar** método de pago
6. **Confirmar** cobro

---

## 👨‍🍳 Manual del Cocinero

### 🍳 **Vista de Cocina**

#### Ver Pedidos Pendientes
1. **Iniciar sesión** como cocinero
2. **Ir a** "Cocina" en el menú
3. **Revisar** comandas en estado "EN_PROCESO"
4. **Ver** detalles de cada pedido

#### Marcar Pedido como Listo
1. **Seleccionar** comanda de la lista
2. **Revisar** productos a preparar
3. **Hacer clic** en "Marcar como Lista"
4. **Confirmar** cambio de estado

#### Ver Pedidos Entregados
1. **Filtrar** por estado "ENTREGADA"
2. **Revisar** historial de pedidos
3. **Ver** tiempos de preparación

### 📦 **Gestión de Inventario**

#### Ver Stock de Ingredientes
1. **Ir a** "Ingredientes" en el menú
2. **Revisar** cantidades disponibles
3. **Identificar** ingredientes con stock bajo

#### Actualizar Stock
1. **Seleccionar** ingrediente
2. **Hacer clic** en "Editar"
3. **Actualizar** cantidad
4. **Guardar** cambios

### 📋 **Gestión de Recetas**

#### Ver Recetas
1. **Ir a** "Recetas" en el menú
2. **Revisar** ingredientes por producto
3. **Ver** cantidades necesarias

#### Editar Receta
1. **Seleccionar** receta
2. **Modificar** ingredientes o cantidades
3. **Guardar** cambios

---

## 🔧 Funcionalidades Comunes

### 🔍 **Búsqueda y Filtros**

#### Filtrar por Fecha
- **Seleccionar** fecha de inicio y fin
- **Aplicar** filtro
- **Ver** resultados filtrados

#### Buscar Productos
- **Escribir** nombre del producto
- **Ver** resultados en tiempo real
- **Seleccionar** producto deseado

### 📱 **Navegación**

#### Menú Principal
- **Hamburguesa** (☰) para abrir menú
- **Iconos** para acceso rápido
- **Navegación** por pestañas

#### Notificaciones
- **Campana** para ver notificaciones
- **Actualizaciones** en tiempo real
- **Alertas** de stock bajo

### 🖨️ **Impresión**

#### Configurar Impresora
1. **Ir a** "Configuración de Impresoras"
2. **Seleccionar** impresora térmica
3. **Probar** conexión
4. **Guardar** configuración

#### Imprimir Ticket
- **Automático** al crear comanda
- **Manual** desde vista de caja
- **Formato** personalizable

---

## 🚨 Solución de Problemas

### ❌ **Error de Acceso Denegado**

**Problema:** No puedo acceder a una función
**Solución:**
1. **Verificar** permisos del usuario
2. **Contactar** al administrador
3. **Solicitar** permisos necesarios

### ❌ **Error al Crear Comanda**

**Problema:** No se puede crear comanda
**Solución:**
1. **Verificar** que la mesa esté libre
2. **Revisar** stock de ingredientes
3. **Intentar** nuevamente

### ❌ **Error de Impresión**

**Problema:** No imprime tickets
**Solución:**
1. **Verificar** conexión de impresora
2. **Revisar** configuración
3. **Probar** impresora manualmente

### ❌ **Error de Base de Datos**

**Problema:** Error al guardar datos
**Solución:**
1. **Recargar** la página
2. **Verificar** conexión a internet
3. **Contactar** soporte técnico

---

## 📞 Soporte Técnico

### Contacto
- **Email:** soporte@restaurante.com
- **Teléfono:** +1-234-567-8900
- **Horario:** 8:00 AM - 6:00 PM

### Información del Sistema
- **Versión:** 2.0
- **Última actualización:** Julio 2025
- **Compatibilidad:** Chrome, Firefox, Safari, Edge

---

**Nota:** Este manual se actualiza regularmente. Para la versión más reciente, consulte la documentación en línea. 