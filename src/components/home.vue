<template>
  <div class="home">
    <nav class="navbar">
    <a href="inicio" class="logo-link">
      <img src="/src/assets/evol_negativo-zoom2.png" alt="Evol" class="logo" />
    </a>

      <div class="links">
        <a href="home">Inicio</a>
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
  background-image: url("/src/assets/banner_login.jpg");
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
