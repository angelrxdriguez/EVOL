<script setup>
import { useRouter } from "../router";
import logoEvol from "../assets/evol_negativo-zoom2.png";
import logoEvolPositivo from "../assets/evol_positivo.png";

const router = useRouter();

function crearDatosInvitado() {
  return {
    nombreUsuario: "Invitado",
    nombreCompleto: "Invitado",
  };
}

function leerDatosUsuario() {
  try {
    const textoUsuario = localStorage.getItem("user");
    if (!textoUsuario) {
      return crearDatosInvitado();
    }

    const usuario = JSON.parse(textoUsuario);
    const nombreUsuario = String(usuario?.nombreUsuario || usuario?.usuario || "Invitado").trim();
    const nombre = String(usuario?.nombre || "").trim();
    const apellidos = String(usuario?.apellidos || "").trim();
    const nombreCompleto = `${nombre} ${apellidos}`.trim() || nombreUsuario;

    return {
      nombreUsuario,
      nombreCompleto,
    };
  } catch {
    return crearDatosInvitado();
  }
}

const datosUsuario = leerDatosUsuario();

function cerrarSesion() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  router.push({ name: "inicio" });
}
</script>

<template>
  <div class="pagina-perfil">
    <nav class="barra-navegacion">
      <RouterLink to="/" class="enlace-logo">
        <img :src="logoEvol" alt="Evol" class="logo" />
      </RouterLink>

      <div class="grupo-enlaces">
        <RouterLink to="/home">Inicio</RouterLink>
        <RouterLink to="/inscribir-clase">Clases</RouterLink>
        <RouterLink to="/mis-clases">Mis clases</RouterLink>
        <RouterLink to="/perfil" class="enlace-activo">Perfil</RouterLink>
      </div>
    </nav>

    <main class="contenido-principal">
      <section class="tarjeta-perfil">
        <h1>Mi perfil</h1>
        <img :src="logoEvolPositivo" alt="Evol" class="logo-perfil" />

        <p class="etiqueta">Nombre de usuario:</p>
        <p class="valor-nombre">{{ datosUsuario.nombreUsuario }}</p>

        <p class="etiqueta">Nombre completo:</p>
        <p class="valor-nombre">{{ datosUsuario.nombreCompleto }}</p>

        <button type="button" class="boton-cerrar-sesion" @click="cerrarSesion">
          Cerrar sesion
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped>
.pagina-perfil {
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
  margin-top: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.tarjeta-perfil {
  width: 100%;
  max-width: 525px;
  background: #ffffff;
  border: 1px solid #d9f8e4;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 8px 20px rgba(11, 15, 26, 0.08);
}

.logo-perfil {
  width: 200px;
  border-radius: 20px;
  height: auto;
  display: block;
  margin: 0 auto 14px;
}

h1 {
  margin: 0 0 16px;
  font-size: 24px;
  color: #000000;
}

.etiqueta {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.valor-nombre {
  margin: 6px 0 20px;
  font-size: 20px;
  font-weight: 700;
  color: #000000;
}

.boton-cerrar-sesion {
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  background-color: var(--verde);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.boton-cerrar-sesion:hover {
  background-color: #62aa7b;
}
</style>
