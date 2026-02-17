<script setup>
import { onMounted, ref } from "vue";

const FORM_INICIAL = {
  nombre: "",
  descripcion: "",
  fecha: "",
  hora: "",
  plazasMaximas: 20,
  imagen: "",
};

const clases = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const errorMsg = ref("");
const okMsg = ref("");
const form = ref({ ...FORM_INICIAL });
const inputImagenRef = ref(null);
const imagenArchivo = ref(null);
const tituloModalInscritos = ref("Inscritos");
const usuariosInscritos = ref([]);
const cargandoInscritos = ref(false);
const errorInscritos = ref("");

const formateadorFecha = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";
  const fecha = new Date(fechaISO);
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
  return Math.max(0, obtenerPlazasMaximas(clase) - contarInscritos(clase));
}

async function abrirModalInscritos(clase) {
  tituloModalInscritos.value = clase?.nombre ? `Inscritos en ${clase.nombre}` : "Inscritos";
  usuariosInscritos.value = [];
  errorInscritos.value = "";
  cargandoInscritos.value = true;

  try {
    const idClase = obtenerIdClase(clase);
    if (!idClase) {
      errorInscritos.value = "Clase invalida";
      return;
    }

    const response = await fetch(`/api/clases/${encodeURIComponent(idClase)}/inscritos`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.ok === false) {
      errorInscritos.value = data?.error || "No se pudieron cargar los inscritos";
      return;
    }

    usuariosInscritos.value = Array.isArray(data?.usuarios) ? data.usuarios : [];
  } catch (e) {
    console.error("[clases] Error cargando inscritos:", e);
    errorInscritos.value = "Error de red al cargar inscritos";
  } finally {
    cargandoInscritos.value = false;
  }
}

function limpiarMensajes() {
  errorMsg.value = "";
  okMsg.value = "";
}

function reiniciarFormulario() {
  form.value = { ...FORM_INICIAL };
  imagenArchivo.value = null;
  if (inputImagenRef.value) {
    inputImagenRef.value.value = "";
  }
}

async function construirPayloadClase(fechaHoraISO) {
  const imagenContenido = await archivoABase64(imagenArchivo.value);
  return {
    nombre: String(form.value.nombre || "").trim(),
    descripcion: String(form.value.descripcion || "").trim(),
    fechaHora: fechaHoraISO,
    plazasMaximas: Number(form.value.plazasMaximas),
    imagen: String(form.value.imagen || "").trim(),
    imagenContenido,
  };
}

function manejarSeleccionImagen(event) {
  const archivo = event?.target?.files?.[0];
  imagenArchivo.value = archivo || null;
  form.value.imagen = archivo?.name ? String(archivo.name).trim() : "";
}

function archivoABase64(archivo) {
  if (!archivo) return Promise.resolve("");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = String(reader.result || "");
      const coma = resultado.indexOf(",");
      resolve(coma >= 0 ? resultado.slice(coma + 1) : resultado);
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(archivo);
  });
}

function construirFechaHoraISO(fecha, hora) {
  if (!fecha || !hora) return "";

  const fechaHora = new Date(`${fecha}T${hora}`);
  if (Number.isNaN(fechaHora.getTime())) return "";

  return fechaHora.toISOString();
}

function validarFormulario() {
  const nombre = String(form.value.nombre || "").trim();
  const descripcion = String(form.value.descripcion || "").trim();
  const fecha = String(form.value.fecha || "").trim();
  const hora = String(form.value.hora || "").trim();
  const plazas = Number(form.value.plazasMaximas);
  const imagen = String(form.value.imagen || "").trim();
  const maxTamanoImagen = 5 * 1024 * 1024;

  if (!nombre) {
    return "El nombre es obligatorio";
  }

  if (!descripcion) {
    return "La descripcion es obligatoria";
  }

  if (!fecha) {
    return "La fecha es obligatoria";
  }

  if (!hora) {
    return "La hora es obligatoria";
  }

  if (!Number.isInteger(plazas) || plazas <= 0) {
    return "Plazas maximas debe ser un entero mayor que 0";
  }

  if (!imagen) {
    return "La imagen es obligatoria";
  }

  if (!imagenArchivo.value) {
    return "Debes seleccionar un archivo de imagen";
  }

  if (imagenArchivo.value.size > maxTamanoImagen) {
    return "La imagen no puede superar 5MB";
  }

  if (!construirFechaHoraISO(fecha, hora)) {
    return "La fecha y hora no es valida";
  }

  return "";
}

async function cargarClases() {
  limpiarMensajes();
  cargando.value = true;

  try {
    const response = await fetch("/api/clases");
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.ok === false) {
      errorMsg.value = data?.error || "No se pudieron cargar las clases";
      return;
    }

    clases.value = Array.isArray(data?.clases) ? data.clases : [];
  } catch (e) {
    console.error("[clases] Error cargando clases:", e);
    errorMsg.value = "Error de red al cargar clases";
  } finally {
    cargando.value = false;
  }
}

async function crearClase() {
  limpiarMensajes();

  const errorValidacion = validarFormulario();
  if (errorValidacion) {
    errorMsg.value = errorValidacion;
    return;
  }

  guardando.value = true;

  try {
    const fechaHoraISO = construirFechaHoraISO(form.value.fecha, form.value.hora);
    if (!fechaHoraISO) {
      errorMsg.value = "La fecha y hora no es valida";
      return;
    }

    const payload = await construirPayloadClase(fechaHoraISO);
    if (!payload.imagenContenido) {
      errorMsg.value = "No se pudo leer la imagen";
      return;
    }

    const response = await fetch("/api/clases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.ok === false) {
      errorMsg.value = data?.error || "No se pudo crear la clase";
      return;
    }

    okMsg.value = "Clase creada correctamente";
    reiniciarFormulario();
    await cargarClases();
  } catch (e) {
    console.error("[clases] Error creando clase:", e);
    errorMsg.value = "Error al crear clase";
  } finally {
    guardando.value = false;
  }
}

onMounted(cargarClases);
</script>

<template>
  <main class="clases-page">
    <header class="topbar">
      <div class="headline">
        <p class="eyebrow">AREA ADMIN</p>
        <h1>Gestion de clases</h1>
        <p class="subtitle">Visualiza y crea clases de forma rapida.</p>
      </div>
    </header>

    <section class="content-grid">
      <section class="form-panel">
        <div class="panel-header">
          <h2>Nueva clase</h2>
        </div>

        <form class="form-grid" @submit.prevent="crearClase">
          <label>
            Nombre
            <input
              v-model="form.nombre"
              type="text"
              placeholder="Ej: Spinning - Nivel Medio"
              maxlength="120"
              required
            />
          </label>

          <label>
            Fecha
            <input v-model="form.fecha" type="date" required />
          </label>

          <label>
            Hora
            <input v-model="form.hora" type="time" required />
          </label>

          <label>
            Plazas maximas
            <input v-model.number="form.plazasMaximas" type="number" min="1" step="1" required />
          </label>

          <label class="full">
            Imagen
            <input
              ref="inputImagenRef"
              type="file"
              accept="image/*"
              required
              @change="manejarSeleccionImagen"
            />
            <small class="input-help">Archivo seleccionado: {{ form.imagen || "-" }}</small>
            <small class="input-help">La imagen se copia automaticamente a src/uploads.</small>
          </label>

          <label class="full">
            Descripcion
            <textarea
              v-model="form.descripcion"
              rows="4"
              maxlength="500"
              placeholder="Descripcion de la clase"
              required
            />
          </label>

          <div class="full form-actions">
            <button class="btn primary" type="submit" :disabled="guardando">
              {{ guardando ? "Guardando..." : "Crear clase" }}
            </button>
          </div>
        </form>

        <p v-if="errorMsg" class="msg error">{{ errorMsg }}</p>
        <p v-if="okMsg" class="msg ok">{{ okMsg }}</p>
      </section>

      <section class="table-panel">
        <div class="panel-header list-header">
          <div>
            <h2>Listado de clases</h2>
            <p>Clases activas e historicas en la coleccion.</p>
          </div>

          <button type="button" class="btn ghost" @click="cargarClases" :disabled="cargando">
            {{ cargando ? "Cargando..." : "Recargar" }}
          </button>
        </div>

        <div class="tabla-wrap">
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
              <tr v-if="!clases.length && !cargando" class="fila-vacia">
                <td colspan="6" class="vacio">No hay clases registradas.</td>
              </tr>
              <tr v-for="clase in clases" :key="clase._id || `${clase.nombre}-${clase.fechaHora}`">
                <td>{{ clase.nombre || "-" }}</td>
                <td class="descripcion-col">{{ clase.descripcion || "-" }}</td>
                <td>{{ formatearFecha(clase.fechaHora) }}</td>
                <td>{{ clase.plazasMaximas ?? "-" }}</td>
                <td>{{ obtenerPlazasRestantes(clase) }}</td>
                <td class="accion-col">
                  <button
                    type="button"
                    class="btn ghost btn-inscritos"
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
            <h5 id="modalInscritosClaseLabel" class="modal-title">{{ tituloModalInscritos }}</h5>
            <button type="button"class="btn-close btn-close-white"data-bs-dismiss="modal"aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <p v-if="cargandoInscritos">Cargando inscritos...</p>
            <p v-else-if="errorInscritos" class="modal-error">{{ errorInscritos }}</p>
            <ul v-else-if="usuariosInscritos.length" class="list-group">
              <li
                v-for="(nombreUsuario, index) in usuariosInscritos"
                :key="`${nombreUsuario}-${index}`"
                class="list-group-item"
              >
                {{ nombreUsuario }}
              </li>
            </ul>
            <p v-else>No hay inscritos en esta clase.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn ghost" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.clases-page {
  min-height: 100vh;
  padding: clamp(20px, 4vw, 46px);
  font-family: var(--font-family);
  color: #d3dae4;
  background-color: var(--oscuro);
}

.topbar {
  width: min(1400px, 100%);
  margin:24px;
}

.headline {
  margin-bottom: 16px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--verde);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  color: var(--verde);
}

.subtitle {
  margin: 0;
  color: #cbd5e1;
}

.content-grid {
  width: min(1400px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(320px, 400px) minmax(0, 1fr);
  gap: 24px;
}

.form-panel,
.table-panel {
  background: rgba(12, 20, 32, 0.82);
  border-radius: 16px;
  box-shadow: none;
}

.form-panel {
  padding: 18px;
  align-self: start;
}

.table-panel {
  padding: 18px 18px 12px;
}

.panel-header {
  margin-bottom: 14px;
}

.panel-header h2 {
  margin: 0 0 4px;
  color: var(--verde);
  font-size: 1.08rem;
}

.panel-header p {
  margin: 0;
  color: #9eabbd;
  font-size: 0.9rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: #c4cedb;
}

input,
textarea {
  width: 100%;
  border: 1px solid rgba(127, 180, 151, 0.28);
  border-radius: 8px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.85);
  color: #000000;
  font-family: inherit;
}


textarea {
}

.input-help {
  color: #93a4ba;
  font-size: 0.8rem;
}

.full {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  border: 1px solid #ffffff;
  border-radius: 6px;
  padding: 9px 14px;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

.btn:hover,
.btn:focus-visible {
  border-color: var(--verde);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn.primary {
  background-color: transparent;
  color: #ffffff;
  border-color: #ffffff;
  font-weight: 700;
}

.btn.primary:hover{
  background-color: var(--verde);
  color: var(--oscuro);
}

.btn.ghost {
  color: #ffffff;
}

.msg {
  margin: 12px 0 0;
  font-size: 0.95rem;
}

.msg.error {
  color: #ffb4b4;
}

.msg.ok {
  color: var(--verde);
}

.tabla-wrap {
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

.descripcion-col {
  max-width: 420px;
}

.accion-col {
  white-space: nowrap;
}

.btn-inscritos {
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

.modal-error {
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

.vacio {
  text-align: center;
  color: #93a4ba;
}
</style>
