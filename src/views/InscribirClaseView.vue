<script setup>
import { computed, onMounted, ref } from "vue";
import logoEvol from "../assets/evol_negativo-zoom2.png";

const clases = ref([]);
const cargando = ref(false);
const errorMsg = ref("");
const okMsg = ref("");
const usuarioId = ref("");
const clasesInscribiendo = ref([]);

function obtenerFechaLocalSinHora(valor) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function obtenerHoraLocal(valor) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "-";

  return fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

function usuarioYaInscrito(clase) {
  if (!usuarioId.value) return false;
  const inscritos = Array.isArray(clase?.inscritos) ? clase.inscritos : [];
  return inscritos.some((id) => normalizarId(id) === usuarioId.value);
}

function estaInscribiendo(idClase) {
  return clasesInscribiendo.value.includes(idClase);
}

async function inscribirse(clase) {
  errorMsg.value = "";
  okMsg.value = "";

  const idClase = obtenerIdClase(clase);

  if (!usuarioId.value) {
    errorMsg.value = "Debes iniciar sesion para inscribirte";
    return;
  }

  if (!idClase) {
    errorMsg.value = "Clase invalida";
    return;
  }

  if (usuarioYaInscrito(clase) || estaInscribiendo(idClase)) {
    return;
  }

  clasesInscribiendo.value = [...clasesInscribiendo.value, idClase];

  try {
    const response = await fetch(`/api/clases/${encodeURIComponent(idClase)}/inscribirse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: usuarioId.value }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.ok === false) {
      errorMsg.value = data?.error || "No se pudo completar la inscripcion";
      return;
    }

    okMsg.value = data?.yaInscrito
      ? "Ya estabas inscrito en esta clase"
      : "Inscripcion realizada";
    await cargarClasesHoy();
  } catch (e) {
    console.error("[inscribir-clase] Error al inscribirse:", e);
    errorMsg.value = "Error de red al inscribirse";
  } finally {
    clasesInscribiendo.value = clasesInscribiendo.value.filter((id) => id !== idClase);
  }
}

function obtenerRutaImagen(nombreImagen) {
  const nombre = String(nombreImagen || "").trim();
  if (!nombre) return "";

  return `/src/uploads/${encodeURIComponent(nombre)}`;
}

const clasesHoy = computed(() => {
  const hoy = obtenerFechaLocalSinHora(new Date());

  return clases.value
    .filter((clase) => obtenerFechaLocalSinHora(clase?.fechaHora) === hoy)
    .slice()
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
});

async function cargarClasesHoy() {
  errorMsg.value = "";
  cargando.value = true;

  try {
    const response = await fetch("/api/clases");
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.ok === false) {
      errorMsg.value = data?.error || "No se pudieron cargar las clases";
      clases.value = [];
      return;
    }

    clases.value = Array.isArray(data?.clases) ? data.clases : [];
  } catch (e) {
    console.error("[inscribir-clase] Error cargando clases:", e);
    errorMsg.value = "Error de red al cargar clases";
    clases.value = [];
  } finally {
    cargando.value = false;
  }
}

onMounted(() => {
  usuarioId.value = obtenerUsuarioIdLocal();
  cargarClasesHoy();
});
</script>

<template>
  <div class="inscribir-page">
    <nav class="navbar">
      <RouterLink to="/" class="logo-link">
        <img :src="logoEvol" alt="Evol" class="logo" />
      </RouterLink>

      <div class="links">
        <RouterLink to="/home">Inicio</RouterLink>
        <RouterLink to="/inscribir-clase">Clases</RouterLink>
        <a href="#">Mis clases</a>
        <a href="#">Perfil</a>
      </div>
    </nav>

    <main class="contenido">
      <h1>Clases de hoy</h1>

      <p v-if="okMsg" class="estado ok">{{ okMsg }}</p>
      <p v-if="cargando" class="estado">Cargando clases...</p>
      <p v-else-if="errorMsg" class="estado error">{{ errorMsg }}</p>
      <p v-else-if="!clasesHoy.length" class="estado">Hoy no hay clases activas.</p>

      <section v-if="!cargando && !errorMsg && clasesHoy.length" class="grid-clases">
        <article
          v-for="clase in clasesHoy"
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
            <p class="dato">Hora: {{ obtenerHoraLocal(clase.fechaHora) }}</p>
            <p class="dato">Plazas: {{ clase.plazasMaximas ?? "-" }}</p>
            <button
              type="button"
              class="btn-inscribirse"
              :disabled="
                !usuarioId ||
                usuarioYaInscrito(clase) ||
                estaInscribiendo(obtenerIdClase(clase))
              "
              @click="inscribirse(clase)"
            >
              {{
                usuarioYaInscrito(clase)
                  ? "Inscrito"
                  : estaInscribiendo(obtenerIdClase(clase))
                  ? "Inscribiendo..."
                  : "Inscribirse"
              }}
            </button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.inscribir-page {
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

.btn-inscribirse {
  width: 100%;
  border: 1px solid var(--verde);
  border-radius: 8px;
  padding: 10px 12px;
  background-color: transparent;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

.btn-inscribirse:hover {
  background-color: var(--verde);
}

.btn-inscribirse:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: transparent;
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
