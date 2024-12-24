<script setup>
import { computed } from "vue";
import { useTasksStore } from "@/stores/tasks";
import LightGallery from "./lightGallery.vue";

const tasksStore = useTasksStore();
const task = computed(() => tasksStore.task);

// Tam dosya yolunu oluşturma
const getFullFilePath = (filePath) => {
  console.log(filePath);
  const baseURL = ""; // Backend URL'si
  return `${baseURL}${filePath.replace("/app/src", "")}`; // `/app/src` kısmını temizle
};

// Dosya türü kontrol fonksiyonları
const isImage = (filePath) => /\.(jpg|jpeg|png|gif)$/i.test(filePath);
const isVideo = (filePath) => /\.(mp4|webm|ogg)$/i.test(filePath);
const isPDF = (filePath) => /\.pdf$/i.test(filePath);
</script>

<template>
  <div>
    <h3>Görev Dosyaları</h3>
    <div v-if="task.filePaths && task.filePaths.length > 0">
      <LightGallery ref="gallery" class="flex flex-row gap-4">
        <div
          v-for="(filePath, index) in task.filePaths"
          :key="index"
          class="flex mb-4 cursor-pointer !h-auto p-0"
        >
          <!-- MIME türüne göre dosya türünü belirleyin -->
          <template v-if="isImage(filePath)">
              <a :href="getFullFilePath(filePath)" data-lg-size="800-600">
                <img
                  role="presentation"
                  :src="getFullFilePath(filePath)"
                  class="w-[50px] h-[50px] object-cover"
                />
              </a>
          </template>

          <template v-else-if="isVideo(filePath)">
            <a :data-src="getFullFilePath(filePath)" data-iframe="true">
              <i class="pi pi-video" style="font-size: 3rem"></i>
            </a>
          </template>

          <template v-else-if="isPDF(filePath)">
            <a :data-src="getFullFilePath(filePath)" data-iframe="true">
              <i
                class="pi pi-file-pdf"
                style="font-size: 3rem; color: red"
              ></i>
            </a>
          </template>

          <template v-else>
            <p>Bu dosya türü desteklenmiyor: {{ filePath }}</p>
          </template>
        </div>
      </LightGallery>
    </div>
    <div v-else>
      <p>Görev için herhangi bir dosya bulunamadı.</p>
    </div>
  </div>
</template>
