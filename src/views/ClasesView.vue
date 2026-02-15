<script setup>
import { onMounted, ref } from "vue";

const clases = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const errorMsg = ref("");
const okMsg = ref("");

const form = ref({
  nombre: "",
  descripcion: "",
  fechaHora: "",
  plazasMaximas: 20,
  estado: "activa",
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return "-";
  return dateFormatter.format(fecha);
}

function limpiarMensajes() {
  errorMsg.value = "";
  okMsg.value = "";
}

async function cargarClases() {
  limpiarMensajes();
  cargando.value = true;

  try {
    const resp = await fetch("/api/clases");
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok || data?.ok === false) {
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

function validarFormulario() {
  const nombre = String(form.value.nombre || "").trim();
  const descripcion = String(form.value.descripcion || "").trim();
  const fechaHora = String(form.value.fechaHora || "").trim();
  const plazas = Number(form.value.plazasMaximas);

  if (!nombre) {
    return "El nombre es obligatorio";
  }

  if (!descripcion) {
    return "La descripcion es obligatoria";
  }

  if (!fechaHora) {
    return "La fecha y hora es obligatoria";
  }

  if (!Number.isInteger(plazas) || plazas <= 0) {
    return "Plazas maximas debe ser un entero mayor que 0";
  }

  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) {
    return "La fecha y hora no es valida";
  }

  return "";
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
    const payload = {
      nombre: form.value.nombre.trim(),
      descripcion: form.value.descripcion.trim(),
      fechaHora: new Date(form.value.fechaHora).toISOString(),
      plazasMaximas: Number(form.value.plazasMaximas),
      estado: "activa",
    };

    const resp = await fetch("/api/clases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok || data?.ok === false) {
      errorMsg.value = data?.error || "No se pudo crear la clase";
      return;
    }

    okMsg.value = "Clase creada correctamente";
    form.value = {
      nombre: "",
      descripcion: "",
      fechaHora: "",
      plazasMaximas: 20,
      estado: "activa",
    };
    await cargarClases();
  } catch (e) {
    console.error("[clases] Error creando clase:", e);
    errorMsg.value = "Error de red al crear clase";
  } finally {
    guardando.value = false;
  }
}

onMounted(() => {
  cargarClases();
});
</script>

<template>
  <main class="clases-page">
    <header class="topbar">
      <div class="headline">
        <p class="eyebrow">AREA ADMIN</p>
        <h1>Gestion de clases</h1>
        <p class="subtitle">Visualiza y crea clases de forma rapida.</p>
      </div>

      <nav class="top-nav" aria-label="Navegacion de administracion">
        <RouterLink to="/admin" class="nav-link">Panel admin</RouterLink>
        <RouterLink to="/clases" class="nav-link active" aria-current="page">Gestionar clases</RouterLink>
        <a href="#" class="nav-link">Gestionar usuarios</a>
        <a href="#" class="nav-link">Gestionar reservas</a>
      </nav>
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
            Fecha y hora
            <input v-model="form.fechaHora" type="datetime-local" required />
          </label>

          <label>
            Plazas maximas
            <input v-model.number="form.plazasMaximas" type="number" min="1" step="1" required />
          </label>

          <label>
            Estado
            <input :value="form.estado" type="text" disabled />
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
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!clases.length && !cargando" class="fila-vacia">
                <td colspan="5" class="vacio">No hay clases registradas.</td>
              </tr>
              <tr v-for="clase in clases" :key="clase._id || `${clase.nombre}-${clase.fechaHora}`">
                <td>{{ clase.nombre || "-" }}</td>
                <td class="descripcion-col">{{ clase.descripcion || "-" }}</td>
                <td>{{ formatearFecha(clase.fechaHora) }}</td>
                <td>{{ clase.plazasMaximas ?? "-" }}</td>
                <td><span class="badge-estado">{{ clase.estado || "-" }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
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

.top-nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-link {
  padding: 10px 14px;
  color: #c8d0db;
  text-decoration: none;
  border: 1px solid #ffffff;
  border-radius: 8px;
  background-color: rgba(18, 28, 42, 0.75);
  transition: background-color 0.2s ease;
}

.nav-link:hover,
.nav-link:focus-visible {
  color: #e5ebf2;
  background-color: rgba(0, 230, 103, 0.22);
  outline: none;
}

.nav-link.active {
  color: #0c1723;
  background-color: var(--verde);
  font-weight: 700;
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
  background-color: rgba(8, 14, 24, 0.85);
  color: #e6ecf3;
  font-family: inherit;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--verde);
  box-shadow: 0 0 0 2px rgba(127, 180, 151, 0.18);
}

input:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
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
  outline: none;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn.primary {
  background-color: var(--verde);
  color: #ffffff;
  border-color: #ffffff;
  font-weight: 700;
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

.badge-estado {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  color: #b4d3c0;
  text-transform: lowercase;
}

.fila-vacia td {
  border-radius: 10px;
}

.vacio {
  text-align: center;
  color: #93a4ba;
}

@media (max-width: 1120px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
