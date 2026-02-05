<template>
  <link rel="stylesheet" href="../style.css">
  <div class="page">
    <div class="contenedor-login">
      <div>
        <img src="/src/assets/evol_positivo.png" class="card-foto" alt="">
      </div>
      <div class="card">
        <h1>Registro</h1>

        <label>
          Nombre.
          <input type="text" placeholder="Nombre" />
        </label>

        <label>
          Apellidos.
          <input type="text" placeholder="Apellidos" />
        </label>

        <label>
          Correo.
          <input type="email" placeholder="Correo" />
        </label>

        <label>
          Contraseña
          <input type="password" placeholder="********" />
        </label>

        <label>
          Repetir contraseña
          <input type="password" placeholder="********" />
        </label>

        <button>Crear cuenta</button>

        <p class="small">
          ¿Ya tienes cuenta? <a href="#" @click.prevent>Inicia sesión</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor-login {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 40px;
  min-height: 100vh;
  background: var(--oscuro);
  font-family: var(--font-family);
}

.page {
  min-height: 100vh;
  background: #f5f7fb;
}

.card-foto {
  width: 320px;
  height: 300px;
  max-width: 40vw;
  padding: 20px;
}

.card {
  width: 350px;
  padding: 24px;
  background: var(--oscuro);
  color: white;
  border-radius: 12px;
  border-top: 4px solid var(--verde);
  border-bottom: 4px solid var(--verde);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

label {
  display: block;
  margin-top: 12px;
  font-size: 14px;
  color: #cfd6e6;
}

input {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  border: 1px solid #2a344b;
  border-radius: 6px;
  background: #0f1626;
  color: #f2f5ff;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  border-color: var(--verde);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.row {
  display: flex;
  gap: 8px;
  align-items: center;
}

button {
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  border: 0;
  border-radius: 6px;
  background: var(--verde);
  color: #0b0f1a;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  filter: brightness(1.05);
}

button:active {
  transform: translateY(1px);
}

.small {
  margin-top: 12px;
  font-size: 13px;
  color: #b7bfd1;
}

.small a {
  color: var(--verde);
  text-decoration: none;
}

.small a:hover {
  text-decoration: underline;
}
</style>
