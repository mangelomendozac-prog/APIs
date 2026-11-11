// Explorador de contenido aleatorio
// Cada sección tiene su propia función asíncrona que consulta una API pública
// y actualiza únicamente su contenedor en la página.

const URL_API_CITAS = "https://dummyjson.com/quotes/random";
const URL_API_PERROS = "https://dog.ceo/api/breeds/image/random";
const URL_API_GATOS = "https://cataas.com/cat?json=true";
const URL_BASE_IMAGEN_GATO = "https://cataas.com/cat/";
const URL_API_DATOS = "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en";

// ---------------------------------------------------------------------------
// Funciones auxiliares de interfaz
// ---------------------------------------------------------------------------

/** Muestra "Cargando…" en la sección y deshabilita su botón. */
function iniciarCarga(contenedor, boton) {
    boton.disabled = true;
    contenedor.replaceChildren();

    const mensaje = document.createElement("div");
    mensaje.className = "mensaje-cargando";
    mensaje.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>Cargando…';
    contenedor.appendChild(mensaje);
}

/** Vuelve a habilitar el botón de la sección (se llama siempre en finally). */
function finalizarCarga(boton) {
    boton.disabled = false;
}

/** Muestra un mensaje de error comprensible con un botón para reintentar. */
function mostrarError(contenedor, textoError, funcionReintentar) {
    contenedor.replaceChildren();

    const alerta = document.createElement("div");
    alerta.className = "alert alert-danger mb-0";
    alerta.setAttribute("role", "alert");

    const parrafo = document.createElement("p");
    parrafo.className = "mb-2";
    parrafo.textContent = textoError;

    const botonReintentar = document.createElement("button");
    botonReintentar.type = "button";
    botonReintentar.className = "btn btn-sm btn-outline-danger";
    botonReintentar.textContent = "Reintentar";
    botonReintentar.addEventListener("click", funcionReintentar);

    alerta.append(parrafo, botonReintentar);
    contenedor.appendChild(alerta);
}

/** Realiza un GET, verifica response.ok y devuelve el JSON. */
async function obtenerJson(url) {
    // cache: "no-store" garantiza que cada clic haga una consulta nueva.
    const respuesta = await fetch(url, { cache: "no-store" });

    if (!respuesta.ok) {
        throw new Error(`La API respondió con el estado HTTP ${respuesta.status}`);
    }

    return await respuesta.json();
}

/**
 * Crea una imagen con tamaño uniforme y espera a que termine de cargar.
 * Si la imagen no se puede descargar, la promesa se rechaza para mostrar el error.
 */
function cargarImagen(urlImagen, textoAlternativo) {
    return new Promise((resolver, rechazar) => {
        const imagen = document.createElement("img");
        imagen.className = "imagen-aleatoria";
        imagen.alt = textoAlternativo;
        imagen.onload = () => resolver(imagen);
        imagen.onerror = () => rechazar(new Error("No se pudo cargar la imagen"));
        imagen.src = urlImagen;
    });
}

/** Envuelve la imagen en un marco de proporción fija (4:3). */
function mostrarImagen(contenedor, imagen) {
    const marco = document.createElement("div");
    marco.className = "marco-imagen";
    marco.appendChild(imagen);
    contenedor.replaceChildren(marco);
}

// ---------------------------------------------------------------------------
// 1. Citas y autores — DummyJSON
// ---------------------------------------------------------------------------
const contenedorCita = document.getElementById("contenido-cita");
const botonCita = document.getElementById("boton-cita");

async function obtenerCita() {
    iniciarCarga(contenedorCita, botonCita);

    try {
        const datosCita = await obtenerJson(URL_API_CITAS);

        const bloqueCita = document.createElement("blockquote");
        bloqueCita.className = "blockquote mb-0";

        const textoCita = document.createElement("p");
        textoCita.className = "texto-cita";
        textoCita.textContent = `“${datosCita.quote}”`;

        const autorCita = document.createElement("footer");
        autorCita.className = "blockquote-footer mt-2";
        autorCita.textContent = datosCita.author;

        bloqueCita.append(textoCita, autorCita);
        contenedorCita.replaceChildren(bloqueCita);
    } catch (error) {
        console.error("Error al obtener la cita:", error);
        mostrarError(contenedorCita, "No se pudo obtener la cita. Verifica tu conexión a Internet e inténtalo de nuevo.", obtenerCita);
    } finally {
        finalizarCarga(botonCita);
    }
}

// ---------------------------------------------------------------------------
// 2. Imágenes de perros — Dog CEO
// ---------------------------------------------------------------------------
const contenedorPerro = document.getElementById("contenido-perro");
const botonPerro = document.getElementById("boton-perro");

async function obtenerPerro() {
    iniciarCarga(contenedorPerro, botonPerro);

    try {
        const datosPerro = await obtenerJson(URL_API_PERROS);

        if (datosPerro.status !== "success") {
            throw new Error("La API de perros no devolvió una imagen válida");
        }

        const imagenPerro = await cargarImagen(datosPerro.message, "Fotografía aleatoria de un perro");
        mostrarImagen(contenedorPerro, imagenPerro);
    } catch (error) {
        console.error("Error al obtener el perro:", error);
        mostrarError(contenedorPerro, "No se pudo mostrar la imagen del perro. Verifica tu conexión a Internet e inténtalo de nuevo.", obtenerPerro);
    } finally {
        finalizarCarga(botonPerro);
    }
}

// ---------------------------------------------------------------------------
// 3. Imágenes de gatos — CATAAS
// La API con ?json=true devuelve: { id, tags, created_at, url, mimetype }.
// Usamos el "id" para construir la URL de la imagen: https://cataas.com/cat/{id}
// ---------------------------------------------------------------------------
const contenedorGato = document.getElementById("contenido-gato");
const botonGato = document.getElementById("boton-gato");

async function obtenerGato() {
    iniciarCarga(contenedorGato, botonGato);

    try {
        const datosGato = await obtenerJson(URL_API_GATOS);

        if (!datosGato.id) {
            throw new Error("La API de gatos no devolvió un identificador");
        }

        const urlImagenGato = URL_BASE_IMAGEN_GATO + encodeURIComponent(datosGato.id);
        const imagenGato = await cargarImagen(urlImagenGato, "Fotografía aleatoria de un gato");
        mostrarImagen(contenedorGato, imagenGato);
    } catch (error) {
        console.error("Error al obtener el gato:", error);
        mostrarError(contenedorGato, "No se pudo mostrar la imagen del gato. Verifica tu conexión a Internet e inténtalo de nuevo.", obtenerGato);
    } finally {
        finalizarCarga(botonGato);
    }
}

// ---------------------------------------------------------------------------
// 4. Datos curiosos — Useless Facts
// ---------------------------------------------------------------------------
const contenedorDato = document.getElementById("contenido-dato");
const botonDato = document.getElementById("boton-dato");

async function obtenerDatoCurioso() {
    iniciarCarga(contenedorDato, botonDato);

    try {
        const datosCuriosos = await obtenerJson(URL_API_DATOS);

        const textoDato = document.createElement("p");
        textoDato.className = "texto-dato mb-0";
        textoDato.textContent = datosCuriosos.text;

        contenedorDato.replaceChildren(textoDato);
    } catch (error) {
        console.error("Error al obtener el dato curioso:", error);
        mostrarError(contenedorDato, "No se pudo obtener el dato curioso. Verifica tu conexión a Internet e inténtalo de nuevo.", obtenerDatoCurioso);
    } finally {
        finalizarCarga(botonDato);
    }
}

// ---------------------------------------------------------------------------
// Eventos e inicialización
// ---------------------------------------------------------------------------
botonCita.addEventListener("click", obtenerCita);
botonPerro.addEventListener("click", obtenerPerro);
botonGato.addEventListener("click", obtenerGato);
botonDato.addEventListener("click", obtenerDatoCurioso);

// Al ingresar a la página se cargan las cuatro secciones de forma independiente:
// cada función maneja sus propios errores, así que el fallo de una no afecta a las demás.
obtenerCita();
obtenerPerro();
obtenerGato();
obtenerDatoCurioso();
