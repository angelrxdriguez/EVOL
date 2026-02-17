<script setup>
import { onMounted, ref } from "vue";
import logoEvol from "../assets/evol_negativo-zoom2.png";

const listaClases = ref([]);
const cargando = ref(false);
const mensajeErrorCarga = ref("");
const mensajeOk = ref("");
const usuarioId = ref("");
const listaClasesCancelando = ref([]);

function obtenerUsuarioIdLocal() {
  try {
    const textoUsuario = localStorage.getItem("user");
    if (!textoUsuario) return "";

    const usuario = JSON.parse(textoUsuario);
    return String(usuario?.id || "").trim();
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

function obtenerHoraLocal(fechaHora) {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return "-";

  return fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obtenerFechaHumana(fechaHora) {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return "-";

  const textoFecha = fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1);
}

function faltan15(fechaHora) {
  const fechaClase = new Date(fechaHora);
  if (Number.isNaN(fechaClase.getTime())) return false;

  const ahora = new Date();
  const diferenciaMs = fechaClase.getTime() - ahora.getTime();
  const quinceMinutosMs = 15 * 60 * 1000;

  return diferenciaMs > quinceMinutosMs;
}

function obtenerRutaImagen(nombreImagen) {
  const nombre = String(nombreImagen || "").trim();
  if (!nombre) return "";

  return `/src/uploads/${encodeURIComponent(nombre)}`;
}

function estaCancelando(idClase) {
  for (const idGuardado of listaClasesCancelando.value) {
    if (idGuardado === idClase) {
      return true;
    }
  }

  return false;
}

function usuarioEstaEnCancelaciones(clase) {
  if (!usuarioId.value) return false;

  const cancelaciones = Array.isArray(clase?.cancelaciones) ? clase.cancelaciones : [];

  for (const idCancelacion of cancelaciones) {
    if (normalizarId(idCancelacion) === usuarioId.value) {
      return true;
    }
  }

  return false;
}

function agregarCancelacion(idClase) {
  if (!idClase) return;
  if (estaCancelando(idClase)) return;

  listaClasesCancelando.value.push(idClase);
}

function quitarCancelacion(idClase) {
  const nuevaLista = [];

  for (const idGuardado of listaClasesCancelando.value) {
    if (idGuardado !== idClase) {
      nuevaLista.push(idGuardado);
    }
  }

  listaClasesCancelando.value = nuevaLista;
}

async function leerJsonSeguro(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function cargarMisClases() {
  mensajeErrorCarga.value = "";
  cargando.value = true;

  if (!usuarioId.value) {
    listaClases.value = [];
    mensajeErrorCarga.value = "Debes iniciar sesion para ver tus clases";
    cargando.value = false;
    return;
  }

  try {
    const url = `/api/clases/usuario/${encodeURIComponent(usuarioId.value)}`;
    const response = await fetch(url);
    const data = await leerJsonSeguro(response);

    if (!response.ok || data?.ok === false) {
      mensajeErrorCarga.value = data?.error || "No se pudieron cargar tus clases";
      listaClases.value = [];
      return;
    }

    if (Array.isArray(data?.clases)) {
      listaClases.value = data.clases;
    } else {
      listaClases.value = [];
    }
  } catch (error) {
    console.error("[mis-clases] Error cargando clases:", error);
    mensajeErrorCarga.value = "Error de red al cargar tus clases";
    listaClases.value = [];
  } finally {
    cargando.value = false;
  }
}

async function cancelarInscripcion(clase) {
  mensajeOk.value = "";

  const idClase = obtenerIdClase(clase);

  if (!usuarioId.value) {
    return;
  }

  if (!idClase) {
    return;
  }

  const cancelacionFueraDePlazo = !faltan15(clase?.fechaHora);

  if (estaCancelando(idClase)) return;

  agregarCancelacion(idClase);

  try {
    const url = `/api/clases/${encodeURIComponent(idClase)}/cancelar-inscripcion`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: usuarioId.value,
        cancelacionFueraDePlazo,
      }),
    });

    const data = await leerJsonSeguro(response);

    if (!response.ok || data?.ok === false) {
      return;
    }

    if (data?.cancelada && !data?.cancelacionFueraDePlazo) {
      mensajeOk.value = "Inscripcion cancelada";
    } else if (!data?.cancelacionFueraDePlazo) {
      mensajeOk.value = "No estabas inscrito en esta clase";
    }

    await cargarMisClases();
  } catch (error) {
    console.error("[mis-clases] Error cancelando inscripcion:", error);
  } finally {
    quitarCancelacion(idClase);
  }
}

function alMontarComponente() {
  usuarioId.value = obtenerUsuarioIdLocal();
  cargarMisClases();
}

onMounted(alMontarComponente);
</script>

<template>
  <div class="pagina-mis-clases">
    <nav class="barra-navegacion">
      <RouterLink to="/" class="enlace-logo">
        <img :src="logoEvol" alt="Evol" class="logo" />
      </RouterLink>

      <div class="grupo-enlaces">
        <RouterLink to="/home">Inicio</RouterLink>
        <RouterLink to="/inscribir-clase">Clases</RouterLink>
        <RouterLink to="/mis-clases" class="enlace-activo">Mis clases</RouterLink>
        <RouterLink to="/perfil">Perfil</RouterLink>
      </div>
    </nav>

    <main class="contenido-principal">
      <h1>Mis clases</h1>

      <p v-if="mensajeOk" class="estado estado-ok">{{ mensajeOk }}</p>
      <p v-if="cargando" class="estado">Cargando clases...</p>
      <p v-else-if="mensajeErrorCarga" class="estado estado-error">{{ mensajeErrorCarga }}</p>
      <p v-else-if="!listaClases.length" class="estado">No tienes clases inscritas.</p>

      <section v-if="!cargando && !mensajeErrorCarga && listaClases.length" class="rejilla-clases">
        <article
          v-for="clase in listaClases"
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

            <div class="caja-fecha">
              <span class="etiqueta-fecha">Fecha de la clase</span>
              <p class="valor-fecha">{{ obtenerFechaHumana(clase.fechaHora) }}</p>
              <p class="hora-fecha">Hora: {{ obtenerHoraLocal(clase.fechaHora) }}</p>
            </div>

            <p v-if="usuarioEstaEnCancelaciones(clase)" class="texto-cancelacion-efectuada">
              Cancelacion efectuada
            </p>

            <button
              v-else
              type="button"
              class="boton-cancelar"
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
.pagina-mis-clases {
  min-height: 100vh;
  background-color: var(--oscuro);
  color: #ffffff;
  font-family: var(--font-family);
}

.barra-navegacion {
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

.enlace-logo {
  display: flex;
  align-items: center;
}

.grupo-enlaces {
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

.enlace-activo {
  color: var(--verde);
}

a:hover {
  border-bottom: solid 2px var(--verde);
  transition: 0.3s;
}

.contenido-principal {
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

.estado-error {
  color: #ffb4b4;
}

.estado-ok {
  color: var(--verde);
}

.texto-cancelacion-efectuada {
  margin: 0 0 10px;
  padding: 8px 10px;
  border: 1px solid #ffffff;
  border-radius: 6px;
  color: var(--verde);
  text-align: center;
}


.rejilla-clases {
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

.caja-fecha {
  margin: 0 0 10px;
  padding: 10px;
  border: 1px solid #ffffff;
  border-radius: 4px;
  background-color: rgb(16, 19, 32);
}

.etiqueta-fecha {
  display: block;
  margin: 4px;
  font-size: smaller;
  color: #c5c5c5;
  text-transform: uppercase;
  font-weight: 700;
}

.caja-fecha .valor-fecha {
  margin: 4px;
  color: #9dc7ff;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
}

.caja-fecha .hora-fecha {
  margin: 0;
  margin-left: 4px;
  color: #c5c5c5;
  font-size: 0.88rem;
}

.boton-cancelar {
  width: 100%;
  border: 1px solid #ffffff;
  border-radius: 6px;
  padding: 9px 14px;
  background-color: transparent;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

.boton-cancelar:hover,
.boton-cancelar:focus-visible {
  border-color: var(--verde);
}

.boton-cancelar:hover {
  background-color: var(--verde);
  color: var(--oscuro);
}

.boton-cancelar:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  background-color: transparent;
  color: #ffffff;
}

@media (max-width: 800px) {
  .grupo-enlaces {
    margin: 12px;
    flex-wrap: wrap;
  }

  .contenido-principal {
    padding-top: 12px;
  }
}
</style>
