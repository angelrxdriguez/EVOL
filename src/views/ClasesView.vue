<script setup>
import { onMounted, ref } from "vue";

const FORMULARIO_INICIAL = {
  nombre: "",
  descripcion: "",
  fecha: "",
  hora: "",
  plazasMaximas: 20,
  imagen: "",
};

const listaClases = ref([]);
const cargandoClases = ref(false);
const guardandoClase = ref(false);
const mensajeError = ref("");
const mensajeOk = ref("");
const formulario = ref({ ...FORMULARIO_INICIAL });
const inputImagen = ref(null);
const archivoImagen = ref(null);
const tituloModal = ref("Inscritos");
const listaInscritos = ref([]);
const cargandoInscritos = ref(false);
const mensajeErrorInscritos = ref("");
const token = ref("");

const formateadorFecha = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatearFecha(fechaIso) {
  if (!fechaIso) return "-";

  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return "-";

  return formateadorFecha.format(fecha);
}

function obtenerIdClase(clase) {
  const id = clase?._id;

  if (id && typeof id === "object" && typeof id.$oid === "string") {
    return String(id.$oid).trim();
  }

  return String(id || "").trim();
}

function obtenerPlazasMaximas(clase) {
  const plazasMaximas = Number(clase?.plazasMaximas);
  if (!Number.isFinite(plazasMaximas) || plazasMaximas <= 0) return 0;
  return plazasMaximas;
}

function contarInscritos(clase) {
  if (!Array.isArray(clase?.inscritos)) return 0;
  return clase.inscritos.length;
}

function obtenerPlazasRestantes(clase) {
  const maximas = obtenerPlazasMaximas(clase);
  const inscritos = contarInscritos(clase);
  return Math.max(0, maximas - inscritos);
}

function obtenerTokenLocal() {
  try {
    return String(localStorage.getItem("token") || "").trim();
  } catch {
    return "";
  }
}

async function leerJsonSeguro(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function limpiarMensajes() {
  mensajeError.value = "";
  mensajeOk.value = "";
}

function reiniciarFormulario() {
  formulario.value = { ...FORMULARIO_INICIAL };
  archivoImagen.value = null;

  if (inputImagen.value) {
    inputImagen.value.value = "";
  }
}

function manejarCambioImagen(evento) {
  const archivo = evento?.target?.files?.[0];
  archivoImagen.value = archivo || null;
  formulario.value.imagen = archivo?.name ? String(archivo.name).trim() : "";
}

function convertirArchivoABase64(archivo) {
  if (!archivo) return Promise.resolve("");

  return new Promise(function (resolve, reject) {
    const lector = new FileReader();

    lector.onload = function () {
      const contenido = String(lector.result || "");
      const posicionComa = contenido.indexOf(",");

      if (posicionComa >= 0) {
        resolve(contenido.slice(posicionComa + 1));
        return;
      }

      resolve(contenido);
    };

    lector.onerror = function () {
      reject(new Error("No se pudo leer la imagen"));
    };

    lector.readAsDataURL(archivo);
  });
}

function crearFechaHoraIso(fecha, hora) {
  if (!fecha || !hora) return "";

  const fechaHora = new Date(`${fecha}T${hora}`);
  if (Number.isNaN(fechaHora.getTime())) return "";

  return fechaHora.toISOString();
}

function validarFormulario() {
  const nombre = String(formulario.value.nombre || "").trim();
  const descripcion = String(formulario.value.descripcion || "").trim();
  const fecha = String(formulario.value.fecha || "").trim();
  const hora = String(formulario.value.hora || "").trim();
  const plazas = Number(formulario.value.plazasMaximas);
  const imagen = String(formulario.value.imagen || "").trim();
  const tamanoMaximoImagen = 5 * 1024 * 1024;

  if (!nombre) return "El nombre es obligatorio";
  if (!descripcion) return "La descripcion es obligatoria";
  if (!fecha) return "La fecha es obligatoria";
  if (!hora) return "La hora es obligatoria";

  if (!Number.isInteger(plazas) || plazas <= 0) {
    return "Plazas maximas debe ser un entero mayor que 0";
  }

  if (!imagen) return "La imagen es obligatoria";
  if (!archivoImagen.value) return "Debes seleccionar un archivo de imagen";
  if (archivoImagen.value.size > tamanoMaximoImagen) return "La imagen no puede superar 5MB";

  const fechaHoraIso = crearFechaHoraIso(fecha, hora);
  if (!fechaHoraIso) return "La fecha y hora no es valida";

  return "";
}

async function construirDatosClase(fechaHoraIso) {
  const imagenContenido = await convertirArchivoABase64(archivoImagen.value);

  return {
    nombre: String(formulario.value.nombre || "").trim(),
    descripcion: String(formulario.value.descripcion || "").trim(),
    fechaHora: fechaHoraIso,
    plazasMaximas: Number(formulario.value.plazasMaximas),
    imagen: String(formulario.value.imagen || "").trim(),
    imagenContenido,
  };
}

async function abrirModalInscritos(clase) {
  tituloModal.value = clase?.nombre ? `Inscritos en ${clase.nombre}` : "Inscritos";
  listaInscritos.value = [];
  mensajeErrorInscritos.value = "";
  cargandoInscritos.value = true;

  try {
    const idClase = obtenerIdClase(clase);
    if (!idClase) {
      mensajeErrorInscritos.value = "Clase invalida";
      return;
    }

    const response = await fetch(`/api/clases/${encodeURIComponent(idClase)}/inscritos`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await leerJsonSeguro(response);

    if (!response.ok || data?.ok === false) {
      mensajeErrorInscritos.value = data?.error || "No se pudieron cargar los inscritos";
      return;
    }

    if (Array.isArray(data?.usuarios)) {
      listaInscritos.value = data.usuarios;
    } else {
      listaInscritos.value = [];
    }
  } catch (error) {
    console.error("[clases] Error cargando inscritos:", error);
    mensajeErrorInscritos.value = "Error de red al cargar inscritos";
  } finally {
    cargandoInscritos.value = false;
  }
}

async function cargarClases() {
  limpiarMensajes();
  cargandoClases.value = true;

  try {
    const response = await fetch("/api/clases");
    const data = await leerJsonSeguro(response);

    if (!response.ok || data?.ok === false) {
      mensajeError.value = data?.error || "No se pudieron cargar las clases";
      listaClases.value = [];
      return;
    }

    if (Array.isArray(data?.clases)) {
      listaClases.value = data.clases;
    } else {
      listaClases.value = [];
    }
  } catch (error) {
    console.error("[clases] Error cargando clases:", error);
    mensajeError.value = "Error de red al cargar clases";
    listaClases.value = [];
  } finally {
    cargandoClases.value = false;
  }
}

async function crearClase() {
  limpiarMensajes();

  const errorValidacion = validarFormulario();
  if (errorValidacion) {
    mensajeError.value = errorValidacion;
    return;
  }

  guardandoClase.value = true;

  try {
    if (!token.value) {
      mensajeError.value = "Sesion invalida, vuelve a iniciar sesion";
      return;
    }

    const fechaHoraIso = crearFechaHoraIso(formulario.value.fecha, formulario.value.hora);
    if (!fechaHoraIso) {
      mensajeError.value = "La fecha y hora no es valida";
      return;
    }

    const datosClase = await construirDatosClase(fechaHoraIso);
    if (!datosClase.imagenContenido) {
      mensajeError.value = "No se pudo leer la imagen";
      return;
    }

    const response = await fetch("/api/clases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(datosClase),
    });

    const data = await leerJsonSeguro(response);

    if (!response.ok || data?.ok === false) {
      mensajeError.value = data?.error || "No se pudo crear la clase";
      return;
    }

    mensajeOk.value = "Clase creada correctamente";
    reiniciarFormulario();
    await cargarClases();
  } catch (error) {
    console.error("[clases] Error creando clase:", error);
    mensajeError.value = "Error al crear clase";
  } finally {
    guardandoClase.value = false;
  }
}

onMounted(() => {
  token.value = obtenerTokenLocal();
  cargarClases();
});
</script>

<template>
  <main class="pagina-clases">
    <header class="cabecera-clases">
      <div class="bloque-titulo">
        <p class="texto-admin">AREA ADMIN</p>
        <h1>Gestion de clases</h1>
        <p class="subtitulo">Visualiza y crea clases de forma rapida.</p>
      </div>
    </header>

    <section class="rejilla-principal">
      <section class="panel-formulario">
        <div class="encabezado-panel">
          <h2>Nueva clase</h2>
        </div>

        <form class="rejilla-formulario" @submit.prevent="crearClase">
          <label class="campo-formulario">
            Nombre
            <input
              v-model="formulario.nombre"
              type="text"
              placeholder="Ej: Spinning - Nivel Medio"
              maxlength="120"
              required
            />
          </label>

          <label class="campo-formulario">
            Fecha
            <input v-model="formulario.fecha" type="date" required />
          </label>

          <label class="campo-formulario">
            Hora
            <input v-model="formulario.hora" type="time" required />
          </label>

          <label class="campo-formulario">
            Plazas maximas
            <input
              v-model.number="formulario.plazasMaximas"
              type="number"
              min="1"
              step="1"
              required
            />
          </label>

          <label class="campo-formulario campo-completo">
            Imagen
            <input
              ref="inputImagen"
              type="file"
              accept="image/*"
              required
              @change="manejarCambioImagen"
            />
            <small class="texto-ayuda">Archivo seleccionado: {{ formulario.imagen || "-" }}</small>
            <small class="texto-ayuda">La imagen se copia automaticamente a src/uploads.</small>
          </label>

          <label class="campo-formulario campo-completo">
            Descripcion
            <textarea
              v-model="formulario.descripcion"
              rows="4"
              maxlength="500"
              placeholder="Descripcion de la clase"
              required
            />
          </label>

          <div class="campo-completo acciones-formulario">
            <button class="boton boton-principal" type="submit" :disabled="guardandoClase">
              {{ guardandoClase ? "Guardando..." : "Crear clase" }}
            </button>
          </div>
        </form>

        <p v-if="mensajeError" class="mensaje mensaje-error">{{ mensajeError }}</p>
        <p v-if="mensajeOk" class="mensaje mensaje-ok">{{ mensajeOk }}</p>
      </section>

      <section class="panel-tabla">
        <div class="encabezado-panel encabezado-listado">
          <div>
            <h2>Listado de clases</h2>
            <p>Clases activas e historicas en la coleccion.</p>
          </div>

          <button
            type="button"
            class="boton boton-secundario"
            @click="cargarClases"
            :disabled="cargandoClases"
          >
            {{ cargandoClases ? "Cargando..." : "Recargar" }}
          </button>
        </div>

        <div class="contenedor-tabla">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Fecha y hora</th>
                <th>Plazas</th>
                <th>Restantes</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!listaClases.length && !cargandoClases" class="fila-vacia">
                <td colspan="6" class="texto-vacio">No hay clases registradas.</td>
              </tr>

              <tr
                v-for="clase in listaClases"
                :key="clase._id || `${clase.nombre}-${clase.fechaHora}`"
              >
                <td>{{ clase.nombre || "-" }}</td>
                <td class="columna-descripcion">{{ clase.descripcion || "-" }}</td>
                <td>{{ formatearFecha(clase.fechaHora) }}</td>
                <td>{{ clase.plazasMaximas ?? "-" }}</td>
                <td>{{ obtenerPlazasRestantes(clase) }}</td>
                <td class="columna-accion">
                  <button
                    type="button"
                    class="boton boton-secundario boton-inscritos"
                    data-bs-toggle="modal"
                    data-bs-target="#modalInscritosClase"
                    @click="abrirModalInscritos(clase)"
                  >
                    VER INSCRITOS
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <div
      id="modalInscritosClase"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="modalInscritosClaseLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="modalInscritosClaseLabel" class="modal-title">{{ tituloModal }}</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            />
          </div>
          <div class="modal-body">
            <p v-if="cargandoInscritos">Cargando inscritos...</p>
            <p v-else-if="mensajeErrorInscritos" class="mensaje-error-modal">{{ mensajeErrorInscritos }}</p>
            <ul v-else-if="listaInscritos.length" class="list-group">
              <li
                v-for="(nombreUsuario, indice) in listaInscritos"
                :key="`${nombreUsuario}-${indice}`"
                class="list-group-item"
              >
                {{ nombreUsuario }}
              </li>
            </ul>
            <p v-else>No hay inscritos en esta clase.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="boton boton-secundario" data-bs-dismiss="modal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.pagina-clases {
  min-height: 100vh;
  padding: clamp(20px, 4vw, 46px);
  font-family: var(--font-family);
  color: #d3dae4;
  background-color: var(--oscuro);
}

.cabecera-clases {
  width: min(1400px, 100%);
  margin: 24px;
}

.bloque-titulo {
  margin-bottom: 16px;
}

.texto-admin {
  margin: 0 0 8px;
  color: var(--verde);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  color: var(--verde);
}

.subtitulo {
  margin: 0;
  color: #cbd5e1;
}

.rejilla-principal {
  width: min(1400px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(320px, 400px) minmax(0, 1fr);
  gap: 24px;
}

.panel-formulario,
.panel-tabla {
  background: rgba(12, 20, 32, 0.82);
  border-radius: 16px;
}

.panel-formulario {
  padding: 18px;
  align-self: start;
}

.panel-tabla {
  padding: 18px 18px 12px;
}

.encabezado-panel {
  margin-bottom: 14px;
}

.encabezado-panel h2 {
  margin: 0 0 4px;
  color: var(--verde);
  font-size: 1.08rem;
}

.encabezado-panel p {
  margin: 0;
  color: #9eabbd;
  font-size: 0.9rem;
}

.encabezado-listado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.rejilla-formulario {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.campo-formulario {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: #c4cedb;
}

.campo-formulario input,
.campo-formulario textarea {
  width: 100%;
  border: 1px solid rgba(127, 180, 151, 0.28);
  border-radius: 8px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.85);
  color: #000000;
  font-family: inherit;
}

.texto-ayuda {
  color: #93a4ba;
  font-size: 0.8rem;
}

.campo-completo {
  grid-column: 1 / -1;
}

.acciones-formulario {
  display: flex;
  justify-content: flex-end;
}

.boton {
  border: 1px solid #ffffff;
  border-radius: 6px;
  padding: 9px 14px;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

.boton:hover,
.boton:focus-visible {
  border-color: var(--verde);
}

.boton:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.boton-principal {
  font-weight: 700;
}

.boton-principal:hover {
  background-color: var(--verde);
  color: var(--oscuro);
}

.mensaje {
  margin: 12px 0 0;
  font-size: 0.95rem;
}

.mensaje-error {
  color: #ffb4b4;
}

.mensaje-ok {
  color: var(--verde);
}

.contenedor-tabla {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  min-width: 680px;
}

th,
td {
  padding: 12px;
  text-align: left;
  vertical-align: top;
  font-size: 0.92rem;
}

th {
  color: var(--verde);
  font-weight: 600;
  font-size: 0.84rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

tbody tr {
  background: rgba(10, 16, 26, 0.75);
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background: rgba(16, 24, 36, 0.88);
}

tbody td:first-child {
  border-radius: 10px 0 0 10px;
}

tbody td:last-child {
  border-radius: 0 10px 10px 0;
}

.columna-descripcion {
  max-width: 420px;
}

.columna-accion {
  white-space: nowrap;
}

.boton-inscritos {
  width: 100%;
}

.modal-content {
  background: #0f1724;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.modal-title {
  color: var(--verde);
}

.mensaje-error-modal {
  margin: 0;
  color: #ffb4b4;
}

.list-group-item {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.fila-vacia td {
  border-radius: 10px;
}

.texto-vacio {
  text-align: center;
  color: #93a4ba;
}
</style>
