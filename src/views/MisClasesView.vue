<script setup>
import { onMounted, ref } from "vue";
import logoEvol from "../assets/evol_negativo-zoom2.png";

const clases = ref([]);
const cargando = ref(false);
const errorMsg = ref("");
const okMsg = ref("");
const usuarioId = ref("");
const clasesCancelando = ref([]);

function obtenerUsuarioIdLocal() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return String(user?.id || "").trim();
  } catch {
    return "";
  }
}

function normalizarId(valor) {
  if (typeof valor === "string") return valor.trim();
  if (valor && typeof valor === "object" && typeof valor.$oid === "string") {
    return valor.$oid.trim();
  }
  if (valor == null) return "";
  return String(valor).trim();
}

function obtenerIdClase(clase) {
  return normalizarId(clase?._id);
}

function obtenerHoraLocal(valor) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "-";

  return fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obtenerFechaHumana(valor) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "-";

  const fechaTexto = fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
}

function obtenerRutaImagen(nombreImagen) {
  const nombre = String(nombreImagen || "").trim();
  if (!nombre) return "";
  return `/src/uploads/${encodeURIComponent(nombre)}`;
}

function estaCancelando(idClase) {
  return clasesCancelando.value.includes(idClase);
}

async function cargarMisClases() {
  errorMsg.value = "";
  cargando.value = true;

  if (!usuarioId.value) {
    clases.value = [];
    errorMsg.value = "Debes iniciar sesion para ver tus clases";
    cargando.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/clases/usuario/${encodeURIComponent(usuarioId.value)}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.ok === false) {
      errorMsg.value = data?.error || "No se pudieron cargar tus clases";
      clases.value = [];
      return;
    }

    clases.value = Array.isArray(data?.clases) ? data.clases : [];
  } catch (e) {
    console.error("[mis-clases] Error cargando clases:", e);
    errorMsg.value = "Error de red al cargar tus clases";
    clases.value = [];
  } finally {
    cargando.value = false;
  }
}

async function cancelarInscripcion(clase) {
  errorMsg.value = "";
  okMsg.value = "";

  const idClase = obtenerIdClase(clase);

  if (!usuarioId.value) {
    errorMsg.value = "Debes iniciar sesion para cancelar";
    return;
  }

  if (!idClase) {
    errorMsg.value = "Clase invalida";
    return;
  }

  if (estaCancelando(idClase)) {
    return;
  }

  clasesCancelando.value = [...clasesCancelando.value, idClase];

  try {
    const response = await fetch(`/api/clases/${encodeURIComponent(idClase)}/cancelar-inscripcion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: usuarioId.value }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.ok === false) {
      errorMsg.value = data?.error || "No se pudo cancelar la inscripcion";
      return;
    }

    okMsg.value = data?.cancelada ? "Inscripcion cancelada" : "No estabas inscrito en esta clase";
    await cargarMisClases();
  } catch (e) {
    console.error("[mis-clases] Error cancelando inscripcion:", e);
    errorMsg.value = "Error de red al cancelar";
  } finally {
    clasesCancelando.value = clasesCancelando.value.filter((id) => id !== idClase);
  }
}

onMounted(() => {
  usuarioId.value = obtenerUsuarioIdLocal();
  cargarMisClases();
});
</script>

<template>
  <div class="mis-clases-page">
    <nav class="navbar">
      <RouterLink to="/" class="logo-link">
        <img :src="logoEvol" alt="Evol" class="logo" />
      </RouterLink>

      <div class="links">
        <RouterLink to="/home">Inicio</RouterLink>
        <RouterLink to="/inscribir-clase">Clases</RouterLink>
        <RouterLink to="/mis-clases" class="active">Mis clases</RouterLink>
        <RouterLink to="/perfil">Perfil</RouterLink>
      </div>
    </nav>

    <main class="contenido">
      <h1>Mis clases</h1>

      <p v-if="okMsg" class="estado ok">{{ okMsg }}</p>
      <p v-if="cargando" class="estado">Cargando clases...</p>
      <p v-else-if="errorMsg" class="estado error">{{ errorMsg }}</p>
      <p v-else-if="!clases.length" class="estado">No tienes clases inscritas.</p>

      <section v-if="!cargando && !errorMsg && clases.length" class="grid-clases">
        <article
          v-for="clase in clases"
          :key="clase._id || `${clase.nombre}-${clase.fechaHora}`"
          class="tarjeta-clase"
        >
          <img
            v-if="obtenerRutaImagen(clase.imagen)"
            :src="obtenerRutaImagen(clase.imagen)"
            :alt="clase.nombre || 'Imagen de clase'"
            class="imagen-clase"
          />

          <div class="info-clase">
            <h2>{{ clase.nombre || "Clase" }}</h2>
            <p>{{ clase.descripcion || "Sin descripcion" }}</p>
            <div class="fecha-campo">
              <span class="fecha-etiqueta">Fecha de la clase</span>
              <p class="fecha-valor">{{ obtenerFechaHumana(clase.fechaHora) }}</p>
              <p class="fecha-hora">Hora: {{ obtenerHoraLocal(clase.fechaHora) }}</p>
            </div>
            <button
              type="button"
              class="btn-cancelar"
              :disabled="estaCancelando(obtenerIdClase(clase))"
              @click="cancelarInscripcion(clase)"
            >
              {{ estaCancelando(obtenerIdClase(clase)) ? "Cancelando..." : "Cancelar" }}
            </button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.mis-clases-page {
  min-height: 100vh;
  background-color: var(--oscuro);
  color: #ffffff;
  font-family: var(--font-family);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--oscuro);
  padding: 0 6px;
}

.logo {
  width: 100px;
  height: auto;
}

.logo-link {
  display: flex;
  align-items: center;
}

.links {
  display: flex;
  margin: 20px;
}

a {
  color: #ffffff;
  text-decoration: none;
  margin: 10px;
  border-bottom: solid 2px var(--oscuro);
  padding-bottom: 4px;
}
.active{
    color: var(--verde);
}
a:hover {
  border-bottom: solid 2px var(--verde);
  transition: 0.3s;
}

.contenido {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 24px 16px 40px;
}

h1 {
  margin: 8px 0 20px;
  color: var(--verde);
  font-size: 1.8rem;
}

.estado {
  margin: 0;
  font-size: 1rem;
  color: #d9e4f0;
}

.estado.error {
  color: #ffb4b4;
}

.estado.ok {
  color: var(--verde);
}

.grid-clases {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.tarjeta-clase {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  overflow: hidden;
}

.imagen-clase {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: #101827;
}

.info-clase {
  padding: 14px;
}

.info-clase h2 {
  margin: 0 0 8px;
  color: var(--verde);
  font-size: 1.08rem;
}

.info-clase p {
  margin: 0 0 8px;
  color: #f4f8ff;
}

.dato {
  font-size: 0.9rem;
  color: #c7d2df;
}

.fecha-campo {
  margin: 0 0 10px;
  padding: 10px;
  border: 1px solid #ffffff;
  border-radius: 4px;
  background-color: rgb(16, 19, 32);
}

.fecha-etiqueta {
  display: block;
  margin: 4px;
  font-size: smaller;
  color: #c5c5c5;
  text-transform: uppercase;
  font-weight: 700;
}

.fecha-campo .fecha-valor {
  margin: 4px;
  color: #9dc7ff;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
}

.fecha-campo .fecha-hora {
  margin: 0;
  margin-left: 4px;
  color: #c5c5c5;
  font-size: 0.88rem;
}

.btn-cancelar {
  width: 100%;
  border: 1px solid #ffffff;
  border-radius: 6px;
  padding: 9px 14px;
  background-color: transparent;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

.btn-cancelar:hover,
.btn-cancelar:focus-visible {
  border-color: var(--verde);
}

.btn-cancelar:hover {
  background-color: var(--verde);
  color: var(--oscuro);
}

.btn-cancelar:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  background-color: transparent;
  color: #ffffff;
}

@media (max-width: 800px) {
  .links {
    margin: 12px;
    flex-wrap: wrap;
  }

  .contenido {
    padding-top: 12px;
  }
}
</style>

