# Explorador de contenido aleatorio

Programación Web III — Tarea: consumo de APIs públicas con `fetch` y `async/await`.

Página web alojada en un proyecto **ASP.NET Core MVC** que consume cuatro APIs públicas y muestra su contenido en cuatro tarjetas independientes: citas, perros, gatos y datos curiosos.

## Integrantes

- Miguel angelo mendoza coronado

## Tecnologías

- ASP.NET Core MVC (.NET 10)
- HTML, CSS y JavaScript (sin librerías adicionales)
- Bootstrap 5 (incluido en la plantilla de ASP.NET Core)

## Instrucciones de ejecución

1. Instalar el [SDK de .NET 10](https://dotnet.microsoft.com/download).
2. Clonar el repositorio o descomprimir el ZIP.
3. Desde la carpeta del proyecto ejecutar:

   ```bash
   dotnet run
   ```

4. Abrir en el navegador la URL que aparece en la consola (por defecto `http://localhost:5088`).

También se puede abrir `ExploradorContenido.csproj` en Visual Studio / Rider / VS Code y ejecutarlo con el botón de *Run*.

> Se requiere conexión a Internet, ya que el contenido se obtiene de APIs públicas.

## Estructura relevante

| Archivo | Descripción |
|---|---|
| `Views/Home/Index.cshtml` | Estructura HTML de las cuatro tarjetas |
| `Views/Shared/_Layout.cshtml` | Plantilla general (Bootstrap, barra de navegación) |
| `wwwroot/js/explorador.js` | Lógica: una función asíncrona por API, estados de carga y manejo de errores |
| `wwwroot/css/site.css` | Estilos: tamaño uniforme de imágenes, diseño de tarjetas |

## Funcionamiento

- Al abrir la página se cargan automáticamente las cuatro secciones.
- Cada sección tiene una función independiente: `obtenerCita()`, `obtenerPerro()`, `obtenerGato()` y `obtenerDatoCurioso()`.
- Durante cada consulta se muestra **"Cargando…"** y el botón de esa sección se deshabilita; se vuelve a habilitar en el bloque `finally`, incluso si ocurre un error.
- Se verifica `response.ok` y los errores se capturan con `try/catch`. Si una consulta falla se muestra un mensaje comprensible con un botón **Reintentar**; las demás secciones siguen funcionando.
- Las imágenes se muestran dentro de un marco de proporción 4:3 con `object-fit: cover`, por lo que todas tienen el mismo tamaño y no se deforman. Si la imagen no se puede descargar (`onerror`), también se muestra el mensaje de error.
- Las tarjetas usan la cuadrícula de Bootstrap: una columna en el teléfono y dos columnas en pantallas medianas o grandes.

## Preguntas de reflexión

### 1. ¿Qué es un endpoint y cuál utilizaste para cada API?

Un **endpoint** es una dirección URL concreta de una API a la que se envía una solicitud HTTP (con un método, como GET) para obtener o modificar un recurso específico. Es el "punto de acceso" a una funcionalidad del servidor.

| API | Método | Endpoint | Campo utilizado |
|---|---|---|---|
| DummyJSON (citas) | GET | `https://dummyjson.com/quotes/random` | `quote`, `author` |
| Dog CEO (perros) | GET | `https://dog.ceo/api/breeds/image/random` | `message` (URL de la imagen) |
| CATAAS (gatos) | GET | `https://cataas.com/cat?json=true` | `id` → imagen en `https://cataas.com/cat/{id}` |
| Useless Facts (datos) | GET | `https://uselessfacts.jsph.pl/api/v2/facts/random?language=en` | `text` |

Al inspeccionar la respuesta de CATAAS se obtuvo un JSON como este:

```json
{ "id": "Y24ZEVXNBjvqkMZy", "tags": [], "created_at": "2019-07-25T12:46:38.946Z",
  "url": "https://cataas.com/cat/Y24ZEVXNBjvqkMZy?position=center", "mimetype": "image/png" }
```

Se utilizó el campo `id` para construir la URL de la imagen.

### 2. ¿Qué diferencia existe entre recibir JSON y recibir directamente una imagen?

Cuando una API devuelve **JSON**, la respuesta es texto con datos estructurados (objetos, propiedades, valores) que JavaScript debe leer con `response.json()` para convertirlo en un objeto y luego usar sus campos (por ejemplo, la URL de una imagen). Cuando la API devuelve **directamente una imagen**, la respuesta es un archivo binario (PNG, JPG, etc.) con un `Content-Type` de imagen; no es texto, por lo que `response.json()` fallaría. Una imagen se muestra simplemente asignando su URL al atributo `src` de una etiqueta `<img>` y el navegador la descarga y la dibuja. Por eso con CATAAS primero se consulta `?json=true` para obtener los datos y después se usa `https://cataas.com/cat/{id}` como `src` de la imagen.

### 3. ¿Qué función cumplen `await` y `response.json()`?

- `fetch()` devuelve una **promesa**, es decir, un resultado que estará disponible en el futuro. `await` pausa la ejecución de la función `async` hasta que esa promesa se resuelva y entrega su valor, sin bloquear el resto de la página. Así el código asíncrono se escribe de forma secuencial y legible.
- `response.json()` lee el cuerpo de la respuesta HTTP y lo convierte de texto JSON a un objeto de JavaScript. También devuelve una promesa (porque el cuerpo puede seguir llegando), por eso se usa `await response.json()`.

### 4. ¿Por qué se debe verificar `response.ok` además de utilizar `try/catch`?

`fetch` solo rechaza la promesa (y entra al `catch`) cuando hay un **error de red**: sin Internet, DNS que no resuelve, CORS, etc. Si el servidor responde con un error HTTP como **404** o **500**, `fetch` lo considera una respuesta válida y **no** lanza una excepción. `response.ok` es `true` solo cuando el código de estado está entre 200 y 299; si es `false`, lanzamos manualmente un `Error` para que el `catch` lo maneje y se muestre el mensaje al usuario. Sin esa verificación intentaríamos procesar una página de error como si fuera el dato correcto.

### 5. ¿Cómo lograste actualizar una sección sin recargar toda la página?

Cada tarjeta tiene un contenedor con un `id` propio (`contenido-cita`, `contenido-perro`, etc.) y un botón con su propio evento `click`. Al presionar el botón se ejecuta solo la función de esa sección, que hace la solicitud con `fetch` en segundo plano (AJAX) y, al recibir la respuesta, modifica únicamente el contenido de su contenedor mediante el DOM (`document.createElement`, `textContent`, `replaceChildren`). Los botones son de tipo `button` (no envían formularios), por lo que el navegador nunca recarga la página y las demás secciones quedan intactas.

## Capturas

Las capturas se entregan por separado en un archivo PDF:

- Las cuatro secciones funcionando y mostrando contenido.
- Un mensaje de error controlado (simulado desconectando Internet y solicitando nuevo contenido).
