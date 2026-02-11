<template>
  <main class="admin">
    <section class="admin-card">
      <header class="admin-header">
        <p class="eyebrow">AREA ADMIN</p>
        <h1>Panel de administracion</h1>
        <p class="subtitle">Selecciona una seccion para gestionar la intranet.</p>
      </header>

      <nav class="menu" aria-label="Menu de administracion">
        <RouterLink to="/clases" class="opcion">
          <span class="opcion-title">Gestionar clases</span>
          <span class="opcion-desc">Crear, editar o ocultar clases.</span>
        </RouterLink>
        <a href="#" class="opcion">
          <span class="opcion-title">Gestionar usuarios</span>
          <span class="opcion-desc">Revisar perfiles y permisos.</span>
        </a>
        <a href="#" class="opcion">
          <span class="opcion-title">Gestionar reservas</span>
          <span class="opcion-desc">Controlar asistencia y cupos.</span>
        </a>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  font-family: var(--font-family);
  background-color: var(--oscuro);
  color: #fff;
}

.admin-card {
  width: 100%;
  max-width: 960px;
  border-radius: 14px;
  padding: clamp(20px, 3vw, 30px);
  background-color: rgba(11, 15, 26, 0.9);
}

.admin-header {
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--verde);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0 0 8px;
  color: var(--verde);
  font-size: clamp(1.5rem, 2.6vw, 2rem);
}

.subtitle {
  margin: 0;
  color: #ffffff;
  opacity: 0.92;
}

.menu {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.opcion {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 150px;
  border: 1px solid #ffffff;
  border-radius: 12px;
  padding: 16px;
  color: #ffffff;
  text-decoration: none;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.opcion:hover,
.opcion:focus-visible {
  border-color: var(--verde);
  transform: translateY(-2px);
  box-shadow: 0 0 0 1px var(--verde);
  outline: none;
}

.opcion-title {
  color: var(--verde);
  font-weight: 700;
}

.opcion-desc {
  line-height: 1.3;
}

@media (max-width: 860px) {
  .menu {
    grid-template-columns: 1fr;
  }

  .opcion {
    min-height: 110px;
  }
}
</style>
