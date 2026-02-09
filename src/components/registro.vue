<script setup>
import logoEvol from "../assets/evol_positivo.png";

const emit = defineEmits(["irInicio"]);
</script>

<template>
  <div class="registro">
    <div class="registro-card">
      <div class="contenedor-evol">
        <img :src="logoEvol" alt="Evol" />
      </div>

      <div class="form-box">
        <h1>Registro</h1>

        <label for="nombre-usuario">Nombre de usuario</label>
        <input id="nombre-usuario" type="text" placeholder="Escribe tu nombre de usuario" />

        <label for="nombre">Nombre</label>
        <input id="nombre" type="text" placeholder="Escribe tu nombre" />

        <label for="apellidos">Apellidos</label>
        <input id="apellidos" type="text" placeholder="Escribe tus apellidos" />

        <label for="contrasena">Contrasena</label>
        <input id="contrasena" type="password" placeholder="Escribe tu contrasena" />

        <label for="repetir-contrasena">Repetir contrasena</label>
        <input id="repetir-contrasena" type="password" placeholder="Repite tu contrasena" />

        <button type="button">Crear cuenta</button>

        <p class="inicio-texto">
          Ya tienes cuenta?
          <button class="inicio-link" type="button" @click="emit('irInicio')">
            Haz click aqui para iniciar sesion
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.registro {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("/src/assets/evol_negativo.png");
  background-color: rgba(0, 0, 0, 0.45);  
  background-blend-mode: multiply;    /*sin esto no va el back*/
  padding: 20px;
  font-family: var(--font-family);
}

.registro-card {
  width: 100%;
  max-width: 820px;
  min-height: 560px;
  display: flex;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.contenedor-evol {
  width: 40%;
  background-color: #22c55e;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.contenedor-evol img {
  max-width: 220px;
  width: 100%;
  height: auto;
}

.form-box {
  width: 60%;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  margin: 0 0 18px 0;
  color: var(--oscuro);
  font-size: 24px;
  text-align: center;
}

label {
  display: block;
  margin-bottom: 6px;
  color: var(--oscuro);
  font-weight: 600;
}

input {
  width: 100%;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
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

.inicio-texto {
  margin: 14px 0 0 0;
  text-align: center;
  color: var(--oscuro);
  font-size: 14px;
}

.inicio-link {
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
  .registro-card {
    max-width: 420px;
    min-height: 700px;
    flex-direction: column;
  }

  .contenedor-evol {
    width: 100%;
    min-height: 180px;
  }

  .form-box {
    width: 100%;
  }
}
</style>
