<script setup>
import { ref } from "vue";
import Inicio from "./components/inicio.vue";
import Registro from "./components/registro.vue";
import Home from "./components/home.vue";

const pantalla = ref("inicio");
</script>

<template>
  <Inicio
    v-if="pantalla === 'inicio'"
    @ir-registro="pantalla = 'registro'"
    @ir-home="pantalla = 'home'"
  />
  <Registro v-else-if="pantalla === 'registro'" @ir-inicio="pantalla = 'inicio'" />
  <Home v-else />
</template>

<style>
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
</style>
