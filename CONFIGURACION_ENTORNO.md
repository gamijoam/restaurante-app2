# Guía de Configuración de Entornos

Este documento centraliza las variables de entorno necesarias para ejecutar el proyecto tanto en un entorno **local** (desarrollo) como en un entorno **web** (producción).

## El Principio Clave

La aplicación está diseñada para ser agnóstica al entorno. Esto significa que el mismo código base funciona en local y en la web. El cambio entre un modo y otro se gestiona únicamente a través de variables de entorno, sin necesidad de modificar el código.

---

## 🖼️ Configuración del Frontend (React)

El frontend necesita saber la dirección del servidor backend para realizar llamadas a la API y para la conexión WebSocket.

* **Archivo a Modificar:** `frontend/.env`
* **Variable Clave:** `VITE_API_BASE_URL`
* **Implementación:** El código lee esta variable para configurar la URL base de Axios y la conexión WebSocket.

#### Valores:

* **Para Desarrollo Local:**
    ```
    VITE_API_BASE_URL=http://localhost:8080
    ```
* **Para Producción Web:**
    ```
    VITE_API_BASE_URL=[https://api.tu-dominio.com](https://api.tu-dominio.com)
    ```

---

## 🖨️ Configuración del Servicio Puente de Impresión

Este servicio es el cliente que se conecta al servidor para escuchar órdenes de impresión. Necesita la dirección del WebSocket del servidor.

* **Archivo a Modificar:** `puente_impresion/.env`
* **Variable Clave:** `WEBSOCKET_SERVER_URL`
* **Implementación:** El código del puente usa esta variable para establecer la conexión WebSocket.

#### Valores:

* **Para Desarrollo Local:**
    ```
    WEBSOCKET_SERVER_URL=ws://localhost:8080/ws
    ```
* **Para Producción Web:** (Nota el uso de `wss` para una conexión segura)
    ```
    WEBSOCKET_SERVER_URL=wss://[api.tu-dominio.com/ws](https://api.tu-dominio.com/ws)
    ```

---

## ⚙️ Configuración del Backend (Java/Spring Boot)

El backend principalmente necesita saber cómo conectarse a la base de datos.

* **Archivo a Modificar:** `backend/src/main/resources/application.properties`
* **Variable Clave:** `spring.datasource.url` (y sus compañeras `username` y `password`)
* **Implementación:** Spring Boot usa estas propiedades para configurar el pool de conexiones a la base de datos.

#### Valores:

* **Para Desarrollo Local:**
    ```properties
    spring.datasource.url=jdbc:mariadb://localhost:3306/restaurante_db
    spring.datasource.username=root
    spring.datasource.password=tu_password_local
    ```
* **Para Producción Web:** (Los valores serán proporcionados por tu proveedor de base de datos en la nube)
    ```properties
    spring.datasource.url=jdbc:mariadb://host.db.produccion:3306/nombre_db_prod
    spring.datasource.username=usuario_prod
    spring.datasource.password=password_seguro_de_prod
    ```

---

## Hoja de Trucos Rápida

| Componente | Archivo de Configuración | Variable a Cambiar | Valor para Local | Valor para Web |
| :--- | :--- | :--- | :--- | :--- |
| 🖼️ **Frontend (React)** | `frontend/.env` | `VITE_API_BASE_URL` | `http://localhost:8080` | `https://api.tu-dominio.com` |
| 🖨️ **Puente de Impresión** | `puente_impresion/.env` | `WEBSOCKET_SERVER_URL` | `ws://localhost:8080/ws` | `wss://api.tu-dominio.com/ws` |
| ⚙️ **Backend (Java)** | `application.properties` | `spring.datasource.url`| `jdbc:mariadb://localhost...` | `jdbc:mariadb://host_prod...`|