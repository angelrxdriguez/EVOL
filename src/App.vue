<script setup>
import { ref } from "vue";
import Inicio from "./components/inicio.vue";
import Registro from "./components/registro.vue";

const pantalla = ref("inicio");
</script>

<template>
  <Inicio v-if="pantalla === 'inicio'" @ir-registro="pantalla = 'registro'" />
  <Registro v-else @ir-inicio="pantalla = 'inicio'" />
</template>

<style>
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
</style>
