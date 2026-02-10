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
        <RouterLink to="/home">Inicio</RouterLink>
        <a href="#">Clases</a>
        <a href="#">Productos</a>
        <a href="#">Contacto</a>
      </div>
    </nav>
  </div>
</template>

<style scoped>
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

a:hover{
border-bottom: solid 2px var(--verde);
transition: 0.3s;
}

</style>
