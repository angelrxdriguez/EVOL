<script setup>
import logoEvol from "../assets/evol_negativo-zoom2.png";
</script>

<template>
  <div class="home">
    <nav class="navbar">
      <RouterLink to="/" class="logo-link">
        <img :src="logoEvol" alt="Evol" class="logo" />
      </RouterLink>

      <div class="links">
        <RouterLink to="/home" class="active">Inicio</RouterLink>
        <RouterLink to="/inscribir-clase">Clases</RouterLink>
        <RouterLink to="/mis-clases">Mis clases</RouterLink>
        <RouterLink to="/perfil">Perfil</RouterLink>
      </div>
    </nav>

    <main class="contenido-home">
      <section class="panel-bienvenida">
        <div class="bienvenida-texto">
          <p class="etiqueta">TU RITMO, TU PROGRESO</p>
          <h1>Bienvenido a tu espacio de entrenamiento</h1>
          <p>
            Organiza tus clases, revisa horarios y mantente al dia con las novedades
            del gimnasio desde una sola pantalla.
          </p>

          <div class="acciones-rapidas">
            <RouterLink to="/inscribir-clase" class="btn-home">VER CLASES</RouterLink>
            <RouterLink to="/mis-clases" class="btn-home">MIS CLASES</RouterLink>
          </div>
        </div>

        <div class="resumen-grid">
          <article class="resumen-item">
            <i class="bi bi-calendar-check" aria-hidden="true"></i>
            <h2>Agenda clara</h2>
            <p>Consulta tus sesiones programadas para toda la semana.</p>
          </article>

          <article class="resumen-item">
            <i class="bi bi-stopwatch" aria-hidden="true"></i>
            <h2>Mas constancia</h2>
            <p>Reserva rapido y evita quedarte sin plaza en tus clases favoritas.</p>
          </article>

          <article class="resumen-item">
            <i class="bi bi-bell" aria-hidden="true"></i>
            <h2>Todo al dia</h2>
            <p>Recibe avisos importantes sobre cambios de sala y horarios.</p>
          </article>
        </div>
      </section>

      <section id="ventajas" class="intro">
        <h2>VENTAJAS DE NUESTRA APP</h2>

        <div class="ventajas-grid">
          <article class="ventaja-item">
            <i class="bi bi-person-plus" aria-hidden="true"></i>
            <p>Inscribete a clases en pocos pasos.</p>
          </article>

          <article class="ventaja-item">
            <i class="bi bi-journal-check" aria-hidden="true"></i>
            <p>Gestiona tus clases y horarios.</p>
          </article>

          <article class="ventaja-item">
            <i class="bi bi-megaphone" aria-hidden="true"></i>
            <p>Consulta novedades y avisos del gimnasio.</p>
          </article>
        </div>
      </section>


    </main>
  </div>
</template>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

.home {
  min-height: 100vh;
  background-image: url("../assets/banner_login2.jpg");
  background-size: cover;
  background-color: rgba(0, 0, 0, 0.418);
  background-position: center;
  background-repeat: no-repeat;
  font-family: var(--font-family);
  background-blend-mode: multiply;
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

.links a {
  color: #ffffff;
  text-decoration: none;
  margin: 10px;
  border-bottom: solid 2px var(--oscuro);
  padding-bottom: 4px;
}

.active {
  color: var(--verde);
}

.link-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.links a:hover {
  border-bottom: solid 2px var(--verde);
  transition: 0.3s;
}

.contenido-home {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 40px;
}

.panel-bienvenida {
  background-color: #0b0f1ac7;
  border-radius: 12px;
  padding: 28px;
  color: #ffffff;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 18px;
  margin-top: 36px;
}

.bienvenida-texto h1 {
  margin: 0 0 12px;
  color: var(--verde);
  font-size: 2rem;
}

.bienvenida-texto p {
  margin: 0;
  line-height: 1.5;
}

.etiqueta {
  color: var(--verde);
  font-weight: 700;
  margin-bottom: 10px;
  letter-spacing: 1px;
  font-size: 0.85rem;
}

.acciones-rapidas {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.btn-home {
  border: 1px solid #ffffff;
  border-radius: 10px;
  padding: 12px 18px;
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
  transition: 0.3s;
}

.btn-home:hover {
  background-color: var(--verde);
  color: var(--oscuro);
  border-color: var(--verde);
}

.resumen-grid {
  display: grid;
  gap: 10px;
}

.resumen-item {
  border: 1px solid #ffffff;
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 4px;
}

.resumen-item i {
  color: var(--verde);
  font-size: 1.3rem;
}

.resumen-item h2 {
  margin: 0;
  font-size: 1.05rem;
}

.resumen-item p {
  margin: 0;
  line-height: 1.4;
}

.intro {
  margin-top: 20px;
  color: #ffffff;
  background-color: #0b0f1ac7;
  border-radius: 12px;
  padding: 28px;
}

.intro h2 {
  margin: 0;
  margin-bottom: 20px;
  color: var(--verde);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 1.35rem;
}

.ventajas-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.ventaja-item {
  border: 1px solid #ffffff;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ventaja-item i {
  color: var(--verde);
  font-size: 1.35rem;
}

.ventaja-item p {
  margin: 0;
  line-height: 1.3;
}

.panel-informacion {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
</style>
