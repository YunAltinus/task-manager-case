<script setup>
import { ref, computed } from "vue";
import { Menubar, Button } from "primevue";
import { useMainThemeStore } from "@/stores/mainTheme";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

const authStore = useAuthStore();

const mainThemeStore = useMainThemeStore();

const items = ref([]);

</script>

<template>
  <div class="card">
    <Menubar :model="items">
      <template #start>
        <h3>TASK MANAGER</h3>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <template v-if="authStore.getIsAuthenticated">
            <Button
              label="Görevler"
              severity="secondary"
              variant="text"
              @click="router.push({ name: 'tasks' })"
            />
            <Button label="Çıkış Yap" severity="secondary" @click="authStore.logout()" />
          </template>
          <template v-else>
            <Button
              label="Giriş Yap"
              severity="secondary"
              variant="text"
              @click="router.push({ name: 'login' })"
            />
            <Button
              label="Kayıt Ol"
              severity="secondary"
              @click="router.push({ name: 'register' })"
            />
          </template>
        </div>
      </template>
    </Menubar>
  </div>
</template>
