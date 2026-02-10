<script setup>
import { ref } from "vue";
import logoEvol from "../assets/evol_positivo.png";

const emit = defineEmits(["irRegistro", "irHome"]);

const nombreUsuario = ref("");
const contrasena = ref("");
const errorMsg = ref("");

async function entrar() {
  errorMsg.value = "";

  try {
    const resp = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombreUsuario: nombreUsuario.value.trim(),
        contrasena: contrasena.value,
      }),
    });

    const raw = await resp.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (!resp.ok || !data.ok) {
      errorMsg.value = data.error || `No se pudo iniciar sesion (HTTP ${resp.status})`;
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    emit("irHome");
  } catch (e) {
    console.error("[login] Error al iniciar sesion:", e);
    errorMsg.value = "Error de red al iniciar sesion";
  }
}
</script>

<template>
  <div class="inicio">
    <div class="login-card">
      <div class="contenedcor-evol">
        <img :src="logoEvol" alt="Evol" />
      </div>

      <div class="login-box">
        <h1>Iniciar sesion</h1>

        <label for="usuario">Usuario</label>
        <input
          id="usuario"
          v-model="nombreUsuario"
          type="text"
          placeholder="Escribe tu usuario"
        />

        <label for="contrasena">Contrasena</label>
        <input
          id="contrasena"
          v-model="contrasena"
          type="password"
          placeholder="Escribe tu contrasena"
        />

        <p v-if="errorMsg" style="color:#ffb4b4; margin: 6px 0 10px;">
          {{ errorMsg }}
        </p>

        <button type="button" @click="entrar">Entrar</button>

        <p class="registro-texto">
          Aun no tienes cuenta?
          <button class="registro-link" type="button" @click="emit('irRegistro')">
            Haz click aqui para registrarte
          </button>
        </p>
      </div>
    </div>
  </div>
</template>


<style scoped>
.inicio {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: var(--font-family);
  background-image: url("/src/assets/banner_login2.jpg");
  background-size: cover;
  background-color: rgba(0, 0, 0, 0.418);  
  background-blend-mode: multiply;    /*sin esto no va el back*/
}

.login-card {
  width: 100%;
  max-width: 820px;
  min-height: 470px;
  display: flex;
  background-color: var(--oscuro);
  color: var(--verde);
  border-radius: 8px;
  overflow: hidden;
}

.contenedcor-evol {
  width: 40%;
  background-color: #22c55e;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.contenedcor-evol img {
  max-width: 220px;
  width: 100%;
  height: auto;
}

.login-box {
  width: 60%;
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  margin-bottom: 18px ;
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
  color: white;
  font-size: 14px;
  border: none;
}
input:focus{
  background-color: #a4ffc5;
  color: black;
  border:none;
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

.registro-texto {
  margin: 14px 0 0 0;
  text-align: center;
  color: white;
  font-size: 14px;
}

.registro-link {
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

@media (max-width: 760px) {
  .login-card {
    max-width: 420px;
    min-height: 560px;
    flex-direction: column;
  }

  .contenedcor-evol {
    width: 100%;
    min-height: 180px;
  }

  .login-box {
    width: 100%;
  }
}
</style>

