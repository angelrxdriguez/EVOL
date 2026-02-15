<script setup>
import logoEvol from "../assets/evol_negativo-zoom2.png";
</script>

<template>
  <div class="inscribir-page">
    <nav class="navbar">
      <RouterLink to="/" class="logo-link">
        <img :src="logoEvol" alt="Evol" class="logo" />
      </RouterLink>

      <div class="links">
        <RouterLink to="/home">Inicio</RouterLink>
        <RouterLink to="/inscribir-clase">Clases</RouterLink>
        <a href="#">Mis clases</a>
        <a href="#">Perfil</a>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.inscribir-page {
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

.content {
  padding: 32px 16px;
}

.card {
  width: min(900px, 100%);
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.04);
}

h1 {
  margin: 0 0 8px;
  color: var(--verde);
}

.card p {
  margin: 0;
}

@media (max-width: 800px) {
  .links {
    margin: 12px;
    flex-wrap: wrap;
  }
}
</style>
