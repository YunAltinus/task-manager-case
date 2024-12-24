<template>
  <div class="flex flex-col w-full gap-4">
    <Select
      v-model="tasksStore.searchModel.status"
      :options="[
        { value: null, label: 'Durum' },
        { value: 'notStarted', label: 'Yapılacaklar' },
        { value: 'completed', label: 'Tamamlananlar' },
      ]"
      optionLabel="label"
      optionValue="value"
      placeholder="Durum"
      fluid
    />

    <div class="flex flex-row justify-center gap-1">
      <template v-for="priority in ['high', 'medium', 'low']">
        <div
          :class="{
            'border border-gray-500 rounded-lg':
              tasksStore.searchModel.priority === priority,
          }"
        >
          <PriorityTag
            :priority
            @click="
              tasksStore.searchModel.priority =
                tasksStore.searchModel.priority == priority ? null : priority
            "
          />
        </div>
      </template>
    </div>
    <DatePicker
      v-model="tasksStore.searchModel.endDate"
      placeholder="Son Tarih"
      name="endDate"
      dateFormat="dd/mm/yy"
      fluid
    />

    <div class="flex items-center gap-2">
      <Checkbox
        v-model="tasksStore.searchModel.hasAttachment"
        inputId="hasAttachment"
        binary
      />
      <label for="hasAttachment"> Kişi Atanmış </label>
    </div>

    <Button
      label="Ara"
      icon="pi pi-search"
      severity="secondary"
      @click="tasksStore.fetchTasks"
    />
  </div>
</template>

<script setup>
import { useTasksStore } from "@/stores/tasks";
import { Select, DatePicker, Checkbox, Button } from "primevue";
import PriorityTag from "./priorityTag.vue";

const tasksStore = useTasksStore();
</script>
