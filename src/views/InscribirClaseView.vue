<script setup>
import { computed, onMounted, ref } from "vue";
import logoEvol from "../assets/evol_negativo-zoom2.png";


const clases = ref([]);
const cargando = ref(false);
const errorMsg = ref("");
const okMsg = ref("");
const usuarioId = ref("");
const token = ref("");
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

function fechaEntendible(valor) {
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

// -------------------------
// Usuario / IDs
// -------------------------
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

function obtenerTokenLocal() {
  try {
    return String(localStorage.getItem("token") || "").trim();
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

// -------------------------
// Inscritos / plazas
// -------------------------
function usuarioYaInscrito(clase) {
  if (!usuarioId.value) return false;

  const inscritos = Array.isArray(clase?.inscritos) ? clase.inscritos : [];

  // Versión “humana”: recorremos y comparamos
  for (const idInscrito of inscritos) {
    if (normalizarId(idInscrito) === usuarioId.value) {
      return true;
    }
  }

  return false;
}

function estaInscribiendo(idClase) {
  return clasesInscribiendo.value.includes(idClase);
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

async function leerJsonSeguro(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function inscribirse(clase) {
  errorMsg.value = "";
  okMsg.value = "";

  const idClase = obtenerIdClase(clase);

  if (!usuarioId.value) {
    errorMsg.value = "Debes iniciar sesion para inscribirte";
    return;
  }

  if (!token.value) {
    errorMsg.value = "Sesion invalida, vuelve a iniciar sesion";
    return;
  }

  if (!idClase) {
    errorMsg.value = "Clase invalida";
    return;
  }

  if (usuarioYaInscrito(clase)) return;
  if (estaInscribiendo(idClase)) return;

  clasesInscribiendo.value.push(idClase);

  try {
    const url = `/api/clases/${encodeURIComponent(idClase)}/inscribirse`;

    const headers = { "Content-Type": "application/json" };
    headers.Authorization = `Bearer ${token.value}`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ usuarioId: usuarioId.value }),
    });

    const data = await leerJsonSeguro(response);

    if (!response.ok || data?.ok === false) {
      errorMsg.value = data?.error || "No se pudo completar la inscripcion";
      return;
    }

    if (data?.yaInscrito) {
      okMsg.value = "Ya estabas inscrito en esta clase";
    } else {
      okMsg.value = "Inscripcion realizada";
    }

    await cargarClasesHoy();
  } catch (e) {
    console.error("[inscribir-clase] Error al inscribirse:", e);
    errorMsg.value = "Error de red al inscribirse";
  } finally {
    // Quitamos el idClase de "clasesInscribiendo" SIN usar filter con callback
    const nuevaLista = [];
    for (const idGuardado of clasesInscribiendo.value) {
      if (idGuardado !== idClase) nuevaLista.push(idGuardado);
    }
    clasesInscribiendo.value = nuevaLista;
  }
}

function obtenerRutaImagen(nombreImagen) {
  const nombre = String(nombreImagen || "").trim();
  if (!nombre) return "";
  return `/src/uploads/${encodeURIComponent(nombre)}`;
}

function compararPorHora(a, b) {
  const ta = new Date(a?.fechaHora).getTime();
  const tb = new Date(b?.fechaHora).getTime();
  return ta - tb;
}

function calcularClasesDeHoy() {
  const hoy = obtenerFechaLocalSinHora(new Date());
  const lista = [];

  for (const clase of clases.value) {
    const fechaClase = obtenerFechaLocalSinHora(clase?.fechaHora);
    if (fechaClase === hoy) {
      lista.push(clase);
    }
  }

  lista.sort(compararPorHora);

  return lista;
}

const clasesHoy = computed(calcularClasesDeHoy);

async function cargarClasesHoy() {
  errorMsg.value = "";
  cargando.value = true;

  try {
    const response = await fetch("/api/clases");
    const data = await leerJsonSeguro(response);

    if (!response.ok || data?.ok === false) {
      errorMsg.value = data?.error || "No se pudieron cargar las clases";
      clases.value = [];
      return;
    }

    if (Array.isArray(data?.clases)) {
      clases.value = data.clases;
    } else {
      clases.value = [];
    }
  } catch (e) {
    console.error("[inscribir-clase] Error cargando clases:", e);
    errorMsg.value = "Error de red al cargar clases";
    clases.value = [];
  } finally {
    cargando.value = false;
  }
}

function alMontarComponente() {
  usuarioId.value = obtenerUsuarioIdLocal();
  token.value = obtenerTokenLocal();
  cargarClasesHoy();
}

onMounted(alMontarComponente);
</script>

<template>
  <div class="inscribir-page">
    <nav class="navbar">
      <RouterLink to="/" class="logo-link">
        <img :src="logoEvol" alt="Evol" class="logo" />
      </RouterLink>

      <div class="links">
        <RouterLink to="/home">Inicio</RouterLink>
        <RouterLink to="/inscribir-clase" class="active">Clases</RouterLink>
        <RouterLink to="/mis-clases">Mis clases</RouterLink>
        <RouterLink to="/perfil">Perfil</RouterLink>
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
            <div class="fecha-campo">
              <span class="fecha-etiqueta">Fecha de la clase</span>
              <p class="fecha-valor">{{ fechaEntendible(clase.fechaHora) }}</p>
              <p class="fecha-hora">Hora: {{ obtenerHoraLocal(clase.fechaHora) }}</p>
            </div>
            <p class="dato">Plazas: {{ clase.plazasMaximas ?? "-" }}</p>
            <p class="plazas-disponibles">{{ obtenerPlazasRestantes(clase) }} RESTANTES</p>
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
            <p class="subtexto">
              Controla tu asistencia en
              <a href="/mis-clases" class="subenlace">Mis clases</a>
            </p>
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
.subtexto{
  font-size: smaller;
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
  background-color: #172338;
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
  margin:4px;
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

.plazas-disponibles {
  margin: 0 0 10px;
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--verde);
  background-color: #172338;
  font-weight: 700;
  text-align: center;
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
</style>
