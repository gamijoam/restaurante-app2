# Sistema de Gestión de Restaurantes

Este proyecto es un sistema integral para la gestión interna de un restaurante, diseñado para optimizar las operaciones diarias desde la toma de pedidos hasta el análisis de ventas.

## MVP (Producto Mínimo Viable)
El objetivo principal es desarrollar un sistema que permita:
- **Gestión de Comandas:** Toma de pedidos digital por parte de los camareros.
- **Gestión de Inventario:** Descuento automático de stock según los platos vendidos.
- **Reportes de Ventas:** Generación de informes básicos de rendimiento.

---

## 🚀 Stack Tecnológico

* **Backend:** Java 17+ / Spring Boot 3
* **Frontend:** React 18+
* **Base de Datos:** MariaDB
* **Gestor de Dependencias (Backend):** Maven
* **Gestor de Dependencias (Frontend):** NPM / Yarn

---

## 🏁 Cómo Empezar

A continuación se detallan los pasos para configurar y ejecutar el proyecto en un entorno de desarrollo local.

### Prerrequisitos
- JDK 17 o superior
- Node.js v18 o superior
- MariaDB

### Instalación

1.  **Clonar el repositorio:**
    ```sh
    git clone [URL_DEL_REPOSITORIO]
    cd restaurante-app
    ```

2.  **Configurar el Backend:**
    ```sh
    cd backend
    # Instrucciones para configurar application.properties y compilar...
    mvn install
    ```

3.  **Configurar el Frontend:**
    ```sh
    cd ../frontend
    npm install
    ```

### Ejecución

-   **Para ejecutar el Backend:**
    ```sh
    cd backend
    mvn spring-boot:run
    ```
-   **Para ejecutar el Frontend:**
    ```sh
    cd frontend
    npm start
    ```

---

## 📖 Documentación de la API
_(Próximamente: Se añadirá un enlace a la documentación de los endpoints de la API REST)_