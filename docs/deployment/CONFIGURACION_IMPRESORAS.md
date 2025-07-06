¡Por supuesto\! Y felicidades de nuevo, has llegado al final de un desarrollo muy complejo. Crear una buena documentación es la marca de un proyecto profesional.

Aquí tienes un documento completo en formato `Markdown` que puedes guardar en tu proyecto (por ejemplo, como `CONFIGURACION_IMPRESORA.md`). Esta guía está pensada para que cualquier persona (incluso no técnica) pueda configurar las impresoras del sistema.

-----

### `CONFIGURACION_IMPRESORA.md`

```markdown
# Guía de Configuración de Impresoras

Este documento explica cómo configurar una impresora térmica USB en Windows para que funcione con el software de gestión del restaurante.

## Requisitos Previos

Antes de empezar, asegúrate de tener lo siguiente:
1.  Una **impresora térmica** con conexión USB.
2.  Un **PC con Windows** donde se conectará la impresora y se ejecutará el "Puente de Impresión".
3.  Los **drivers o controladores** de la impresora correctamente instalados en el PC.
4.  El servicio **"Puente de Impresión"** (el script `index.js`) ejecutándose en el PC.

---

## Paso 1: Instalar y Verificar la Impresora en Windows

1.  **Conecta** la impresora térmica al PC a través del puerto USB.
2.  **Instala los drivers** que vinieron con tu impresora. Si no tienes un CD, búscalos en la página web del fabricante.
3.  Una vez instalada, ve a **Panel de Control > Dispositivos e impresoras**.
4.  Busca tu impresora, haz clic derecho sobre ella y selecciona **Propiedades de impresora**.
5.  En la pestaña "General", haz clic en **"Imprimir página de prueba"**.
    * **Si la página se imprime correctamente**, significa que la impresora y los drivers funcionan. ¡Excelente!
    * **Si no se imprime**, debes resolver este problema de hardware/drivers antes de continuar.

---

## Paso 2: Compartir la Impresora en Red (El Paso Clave)

Para que nuestro software pueda comunicarse con la impresora de forma fiable, vamos a "compartirla" en la red. Esto crea un punto de acceso directo que nuestro sistema puede usar.

1.  Vuelve a la ventana de **Dispositivos e impresoras**.
2.  Haz clic derecho sobre tu impresora térmica y selecciona de nuevo **Propiedades de impresora**.
3.  Ve a la pestaña **"Compartir"**.
4.  Marca la casilla que dice **"Compartir esta impresora"**.
5.  En el campo **"Nombre del recurso compartido"**, escribe un nombre corto, simple, en minúsculas y sin espacios. Este nombre es muy importante.
    * **Recomendación:** `ticketera`
6.  Haz clic en **Aceptar**.

![Guía para compartir la impresora en Windows](https://i.imgur.com/uC0VpUv.png)

---

## Paso 3: Configurar la Impresora en el Software

Ahora le diremos a nuestra aplicación cómo encontrar esa impresora que acabamos de compartir.

1.  Asegúrate de que todos los servicios estén corriendo: **Backend (Java)**, **Frontend (React)** y el **Puente de Impresión (Node.js)**.
2.  Entra a la aplicación web con un usuario que tenga el rol de **Gerente**.
3.  En la barra de navegación, haz clic en el enlace **"Impresoras"**.
4.  Verás el panel de "Configuración de Impresoras". Ahora, debes crear una regla para cada "rol" de impresión que necesites.

#### Configuración para la Cocina (Impresión Automática)
* **Rol:** Selecciona `COCINA`.
* **Tipo de Conexión:** Selecciona `TCP`.
* **Destino:** Escribe la "ruta de red" a la impresora. Si el Puente de Impresión corre en la misma PC que la impresora, la ruta es: `\\127.0.0.1\ticketera`
    * `127.0.0.1` significa "esta misma computadora".
    * `ticketera` es el "Nombre del recurso compartido" que definimos en el Paso 2.
* Haz clic en **"Guardar"**.

#### Configuración para la Caja (Impresión Manual)
* **Rol:** Selecciona `CAJA`.
* **Tipo de Conexión:** Selecciona `TCP`.
* **Destino:** Escribe exactamente la misma ruta: `\\127.0.0.1\ticketera`
* Haz clic en **"Guardar"**.

Verás tus configuraciones guardadas en la lista de "Configuraciones Actuales".

---

## Paso 4: ¡Verificación Final!

1.  **Prueba de Cocina:** Crea una nueva comanda en la aplicación. El ticket debería imprimirse automáticamente. Revisa la consola donde corre el "Puente de Impresión" para ver los mensajes de actividad.
2.  **Prueba de Caja:** Ve a la vista de `/caja`, busca una comanda y haz clic en el botón "Imprimir". El ticket debería imprimirse.

¡Y eso es todo! Tu sistema de impresión está 100% configurado y listo para operar.
```