<script setup>
import { useRouter } from "../router";
import logoEvol from "../assets/evol_negativo-zoom2.png";
import logoEvolPositivo from "../assets/evol_positivo.png";

const router = useRouter();

function leerDatosUsuario() {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      return {
        nombreUsuario: "Invitado",
        nombreCompleto: "Invitado",
      };
    }

    const user = JSON.parse(rawUser);
    const nombreUsuario = user?.nombreUsuario || user?.usuario || "Invitado";
    const nombre = String(user?.nombre || "").trim();
    const apellidos = String(user?.apellidos || "").trim();
    const nombreCompleto = `${nombre} ${apellidos}`.trim() || nombreUsuario;

    return { nombreUsuario, nombreCompleto };
  } catch {
    return {
      nombreUsuario: "Invitado",
      nombreCompleto: "Invitado",
    };
  }
}

const { nombreUsuario, nombreCompleto } = leerDatosUsuario();

function cerrarSesion() {
  localStorage.removeItem("user");
  router.push({ name: "inicio" });
}
</script>

<template>
  <div class="perfil-page">
    <nav class="navbar">
      <RouterLink to="/" class="logo-link">
        <img :src="logoEvol" alt="Evol" class="logo" />
      </RouterLink>

      <div class="links">
        <RouterLink to="/home">Inicio</RouterLink>
        <RouterLink to="/inscribir-clase">Clases</RouterLink>
        <RouterLink to="/mis-clases">Mis clases</RouterLink>
        <RouterLink to="/perfil">Perfil</RouterLink>
      </div>
    </nav>

    <main class="contenido">
      <section class="perfil-card">
        <h1>Mi perfil</h1>
        <img :src="logoEvolPositivo" alt="Evol" class="perfil-logo" />
        <p class="label">Nombre de usuario:</p>
        <p class="nombre">{{ nombreUsuario }}</p>
        <p class="label">Nombre completo:</p>
        <p class="nombre">{{ nombreCompleto }}</p>

        <button type="button" class="logout-btn" @click="cerrarSesion">
          Cerrar sesion
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped>
.perfil-page {
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
margin-top: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.perfil-card {
  width: 100%;
  max-width: 525px;
  background: #ffffff;
  border: 1px solid #d9f8e4;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 8px 20px rgba(11, 15, 26, 0.08);
}

.perfil-logo {
  width: 200px;
  border-radius: 20px;
  height: auto;
  display: block;
  margin: 0 auto 14px;
}

h1 {
  margin: 0 0 16px;
  font-size: 24px;
    color: black;
}

.label {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.nombre {
  margin: 6px 0 20px;
  font-size: 20px;
  font-weight: 700;
  color: black;
}

.logout-btn {
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

.logout-btn:hover {
  background-color: #62aa7b;
}
</style>
