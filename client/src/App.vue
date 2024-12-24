<script setup>
import { RouterView } from 'vue-router'
import { Toast, ConfirmPopup } from 'primevue'
import Navbar from './components/statics/navbar.vue'

</script>

<template>
  <div class="main-wrapper">
    <Navbar />
    <Toast />
    <ConfirmPopup />

    <div class="main-container">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
