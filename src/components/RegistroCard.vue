<template>
  <link rel="stylesheet" href="../style.css">
  <div class="page">
    <div class="contenedor-login">
      <div class="auth-shell">
        <div class="media">
          <img src="/src/assets/evol_positivo.png" class="card-foto" alt="">
        </div>
        <div class="card">
          <div class="card-header">
            <h1>Registro</h1>
          </div>

          <div class="card-body">
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
          </div>

          <div class="card-footer">
            <p class="small">
              ¿Ya tienes cuenta? <a href="#" @click.prevent>Inicia sesión</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor-login {
  display: grid;
  place-items: center;
  padding: 32px 16px;
  min-height: 100vh;
  background-image:
    linear-gradient(rgba(11, 15, 26, 0.7), rgba(11, 15, 26, 0.85)),
    url("/src/assets/evol_negativo.png");
  background-size: cover;
  background-position: center;
  font-family: var(--font-family);
}

.page {
  min-height: 100vh;
  background: var(--oscuro);
}

.auth-shell {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: minmax(240px, 360px) minmax(320px, 1fr);
  border-radius: 18px;
  overflow: hidden;
  background: rgba(11, 15, 26, 0.9);
  border: 1px solid rgba(34, 197, 94, 0.2);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
}

.media {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background:
    radial-gradient(circle at top, rgba(34, 197, 94, 0.25), transparent 60%),
    linear-gradient(160deg, rgba(34, 197, 94, 0.18), rgba(11, 15, 26, 0.85));
}

.card-foto {
  width: 100%;
  max-width: 280px;
  height: auto;
  object-fit: contain;
}

.card {
  padding: 28px 32px;
  color: #f2f5ff;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: clamp(480px, 70vh, 560px);
}

.card-header h1 {
  margin: 0;
  font-size: clamp(22px, 2.4vw, 28px);
  letter-spacing: 0.2px;
}

.card-body {
  display: grid;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.card-footer {
  margin-top: auto;
}

label {
  display: grid;
  gap: 6px;
  font-size: 14px;
  color: rgba(242, 245, 255, 0.75);
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
  background: rgba(11, 15, 26, 0.9);
  color: #f2f5ff;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

input:focus {
  border-color: var(--verde);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
  background: rgba(11, 15, 26, 0.75);
}

.row {
  display: flex;
  gap: 8px;
  align-items: center;
}

button {
  width: 100%;
  margin-top: 6px;
  padding: 11px 12px;
  border: 0;
  border-radius: 8px;
  background: var(--verde);
  color: #0b0f1a;
  font-weight: 600;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

button:hover {
  filter: brightness(1.05);
}

button:active {
  transform: translateY(1px);
}

.small {
  margin: 0;
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

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .media {
    padding: 22px 16px;
  }

  .card {
    height: auto;
  }
}

@media (max-width: 520px) {
  .contenedor-login {
    padding: 20px 12px;
  }

  .card {
    padding: 22px;
  }

  .card-foto {
    max-width: 220px;
  }
}
</style>
