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

    <section id="ventajas" class="intro">
      <h1>
        VENTAJAS DE NUESTRA APP
      </h1>

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

        <RouterLink to="/inscribir-clase" class="ventaja-item clases">
          <p>VER CLASES</p>
        </RouterLink>
      </div>
    </section>
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

a {
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

a:hover {
  border-bottom: solid 2px var(--verde);
  transition: 0.3s;
}

.intro {
  max-width: 950px;
  margin: 48px auto 0;
  margin-top: 150px;
  color: #ffffff;
  background-color: #0b0f1ac7;
  border-radius: 12px;
  padding: 50px;
}

.intro h1 {
  margin: 0;
  margin-bottom: 20px;
  color: var(--verde);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
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

.clases {
  grid-column: 1 / -1;
  justify-content: center;
  margin: 0;
  margin-top: 150px;
  margin-bottom: 50px;
  margin-left: 50px;
  margin-right: 50px;
  padding: 14px;
  border-bottom: 1px solid #ffffff;
  transition: 0.4s;
}

.clases:hover {
  background-color: var(--verde);
  color: var(--oscuro);
  border-color: var(--verde);
}

.clases:hover i {
  color: var(--oscuro);
}
</style>
