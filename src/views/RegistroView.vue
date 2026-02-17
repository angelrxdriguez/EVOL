<script setup>
import { ref } from "vue";
import { useRouter } from "../router";
import logoEvol from "../assets/evol_positivo.png";

const usuarioNuevo = ref("");
const nombreNuevo = ref("");
const apellidosNuevos = ref("");
const contrasenaNueva = ref("");
const repetirContrasenaNueva = ref("");
const mensajeErrorRegistro = ref("");
const router = useRouter();

function limpiarErrorRegistro() {
  mensajeErrorRegistro.value = "";
}

function validarContrasenas() {
  if (!contrasenaNueva.value) {
    return "La contrasena esta vacia o no coincide";
  }

  if (contrasenaNueva.value !== repetirContrasenaNueva.value) {
    return "La contrasena esta vacia o no coincide";
  }

  return "";
}

function construirDatosRegistro() {
  return {
    nombreUsuario: String(usuarioNuevo.value || "").trim(),
    nombre: String(nombreNuevo.value || "").trim(),
    apellidos: String(apellidosNuevos.value || "").trim(),
    contrasena: contrasenaNueva.value,
  };
}

async function leerJsonSeguro(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function crearCuenta() {
  const errorContrasena = validarContrasenas();
  if (errorContrasena) {
    mensajeErrorRegistro.value = errorContrasena;
    return;
  }

  limpiarErrorRegistro();

  try {
    const response = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(construirDatosRegistro()),
    });

    const data = await leerJsonSeguro(response);

    if (!response.ok) {
      mensajeErrorRegistro.value = data?.error || "No se pudo crear la cuenta";
      return;
    }

    if (data?.ok === true) {
      router.push({ name: "inicio" });
      return;
    }

    mensajeErrorRegistro.value = "No se pudo crear la cuenta";
  } catch {
    mensajeErrorRegistro.value = "Error de red al crear usuario";
  }
}

function irInicio() {
  router.push({ name: "inicio" });
}
</script>

<template>
  <div class="pagina-registro">
    <div class="tarjeta-registro">
      <div class="contenedor-logo">
        <img :src="logoEvol" alt="Evol" />
      </div>

      <div class="caja-formulario">
        <h1>Bienvenido</h1>

        <label for="nombre-usuario">Nombre de usuario</label>
        <input
          id="nombre-usuario"
          v-model="usuarioNuevo"
          type="text"
          placeholder="Escribe tu nombre de usuario"
        />

        <label for="nombre">Nombre</label>
        <input id="nombre" v-model="nombreNuevo" type="text" placeholder="Escribe tu nombre" />

        <label for="apellidos">Apellidos</label>
        <input
          id="apellidos"
          v-model="apellidosNuevos"
          type="text"
          placeholder="Escribe tus apellidos"
        />

        <label for="contrasena">Contrasena</label>
        <input
          id="contrasena"
          v-model="contrasenaNueva"
          type="password"
          placeholder="Escribe tu contrasena"
        />

        <label for="repetir-contrasena">Repetir contrasena</label>
        <input
          id="repetir-contrasena"
          v-model="repetirContrasenaNueva"
          type="password"
          placeholder="Repite tu contrasena"
        />

        <button type="button" @click="crearCuenta">Crear cuenta</button>
        <p v-if="mensajeErrorRegistro" class="texto-error">{{ mensajeErrorRegistro }}</p>

        <p class="texto-inicio">
          Ya tienes cuenta?
          <button class="enlace-inicio" type="button" @click="irInicio">
            Haz click aqui para iniciar sesion
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagina-registro {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("../assets/banner_login2.jpg");
  background-size: cover;
  background-color: rgba(0, 0, 0, 0.418);
  background-blend-mode: multiply;
  padding: 20px;
  font-family: var(--font-family);
}

.tarjeta-registro {
  width: 100%;
  max-width: 820px;
  min-height: 560px;
  display: flex;
  background-color: var(--oscuro);
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

.caja-formulario {
  width: 60%;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  margin: 0 0 18px;
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

.texto-inicio {
  margin: 14px 0 0;
  text-align: center;
  color: #ffffff;
  font-size: 14px;
}

.texto-error {
  margin: 12px 0 0;
  text-align: center;
  color: #f87171;
  font-size: 14px;
}

.enlace-inicio {
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
