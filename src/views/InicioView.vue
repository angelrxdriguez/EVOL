<script setup>
import { ref } from "vue";
import { useRouter } from "../router";
import logoEvol from "../assets/evol_positivo.png";

const usuarioEscrito = ref("");
const contrasenaEscrita = ref("");
const mensajeError = ref("");
const router = useRouter();

function limpiarMensajeError() {
  mensajeError.value = "";
}

async function leerJsonSeguroDesdeTexto(response) {
  const texto = await response.text();
  if (!texto) return {};

  try {
    return JSON.parse(texto);
  } catch {
    return {};
  }
}

function guardarUsuarioLocal(usuario) {
  localStorage.setItem("user", JSON.stringify(usuario));
}

function guardarTokenLocal(token) {
  localStorage.setItem("token", String(token || ""));
}

function esUsuarioAdmin(usuario) {
  return Number(usuario?.es_admin) === 1;
}

async function entrar() {
  limpiarMensajeError();

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombreUsuario: String(usuarioEscrito.value || "").trim(),
        contrasena: contrasenaEscrita.value,
      }),
    });

    const data = await leerJsonSeguroDesdeTexto(response);

    if (!response.ok || !data?.ok) {
      mensajeError.value = data?.error || `No se pudo iniciar sesion (HTTP ${response.status})`;
      return;
    }

    guardarUsuarioLocal(data.user);
    guardarTokenLocal(data.token);

    if (esUsuarioAdmin(data.user)) {
      router.push({ name: "clases" });
      return;
    }

    router.push({ name: "home" });
  } catch (error) {
    console.error("[login] Error al iniciar sesion:", error);
    mensajeError.value = "Error de red al iniciar sesion";
  }
}

function irARegistro() {
  router.push({ name: "registro" });
}
</script>

<template>
  <div class="pagina-inicio">
    <div class="tarjeta-login">
      <div class="contenedor-logo">
        <img :src="logoEvol" alt="Evol" />
      </div>

      <div class="caja-login">
        <h1>Iniciar sesion</h1>

        <label for="usuario">Usuario</label>
        <input
          id="usuario"
          v-model="usuarioEscrito"
          type="text"
          placeholder="Escribe tu usuario"
        />

        <label for="contrasena">Contrasena</label>
        <input
          id="contrasena"
          v-model="contrasenaEscrita"
          type="password"
          placeholder="Escribe tu contrasena"
        />

        <p v-if="mensajeError" class="texto-error">
          {{ mensajeError }}
        </p>

        <button type="button" @click="entrar">Entrar</button>

        <p class="texto-registro">
          Aun no tienes cuenta?
          <button class="enlace-registro" type="button" @click="irARegistro">
            Haz click aqui para registrarte
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagina-inicio {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: var(--font-family);
  background-image: url("../assets/banner_login2.jpg");
  background-size: cover;
  background-color: rgba(0, 0, 0, 0.418);
  background-blend-mode: multiply;
}

.tarjeta-login {
  width: 100%;
  max-width: 820px;
  min-height: 470px;
  display: flex;
  background-color: var(--oscuro);
  color: var(--verde);
  border-radius: 8px;
  overflow: hidden;
}

.contenedor-logo {
  width: 40%;
  background-color: #22c55e;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.contenedor-logo img {
  max-width: 220px;
  width: 100%;
  height: auto;
}

.caja-login {
  width: 60%;
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  margin-bottom: 18px;
  color: var(--verde);
  font-size: 24px;
  text-align: center;
}

label {
  display: block;
  margin-bottom: 6px;
  color: var(--verde);
  font-weight: 600;
}

input {
  width: 100%;
  margin-bottom: 12px;
  padding: 10px;
  border-radius: 6px;
  background-color: var(--oscuro);
  color: #ffffff;
  font-size: 14px;
  border: none;
}

input:focus {
  background-color: #a4ffc5;
  color: #000000;
  border: none;
  transition: 0.5s;
}

button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background-color: var(--verde);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.texto-error {
  color: #ffb4b4;
  margin: 6px 0 10px;
}

.texto-registro {
  margin: 14px 0 0;
  text-align: center;
  color: #ffffff;
  font-size: 14px;
}

.enlace-registro {
  width: auto;
  margin-left: 6px;
  padding: 0;
  border: none;
  background: none;
  color: var(--verde);
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
</style>
