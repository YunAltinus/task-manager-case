<script setup>
import { Card, Avatar, Button, useToast, useConfirm } from "primevue";
import { useTasksStore } from "@/stores/tasks";
import { useUiStore } from "@/stores/ui";
import PriorityTag from "@/components/tasks/priorityTag.vue";

const tasksStore = useTasksStore();
const uiStore = useUiStore();

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const toast = useToast();
const confirm = useConfirm();

const confirmDelete = (event, task) => {
  confirm.require({
    target: event.currentTarget,
    message: "Devam etmek istediğinizden emin misiniz?",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "İptal",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Sil",
    },
    accept: () => {
      const deletResult = tasksStore.deleteTask(task);
      if (deletResult)
        toast.add({
          severity: "success",
          summary: "Silindi",
          detail: "Görev Silindi",
          life: 3000,
        });
      else
        toast.add({
          severity: "error",
          summary: "Silinemedi",
          detail: "Görev Silinemedi",
          life: 3000,
        });
    },
    reject: () => {
      // toast.add({ severity: 'error', summary: 'Reddedildi', detail: 'Reddettiniz', life: 3000 });
    },
  });
};
</script>

<template>
  <Card class="bg-emphasis w-full cursor-move rounded-lg p-2" unstyled>
    <template #header>
      <div class="flex flex-row justify-between items-center">
        <div>
          <Avatar v-if="task?.assignedTo?.username" :label="task.assignedTo.username.charAt(0).toUpperCase()" class="mr-2" style="background-color: #dee9fc; color: #1a2551" shape="square" />
          <Avatar v-else  class="mr-2" style="background-color: #dee9fc; color: #1a2551" shape="square" />
          <!-- <span>{{ task.user.name }} {{ task.user.surname }}</span> -->
        </div>

        <div>
          <Button icon="pi pi-pen-to-square" class="hover:text-green-500 hover:bg-green-500 hover:bg-opacity-10"
            severity="secondary" variant="text" rounded @click="tasksStore.goEditTask(task)" />
          <Button icon="pi pi-times" class="hover:text-red-500 hover:bg-red-500 hover:bg-opacity-10"
            severity="secondary" variant="text" rounded @click="confirmDelete($event, task)" />
        </div>
      </div>
    </template>
    <template #title>
      <div class="py-2" @click="tasksStore.goEditTask(task)">
        {{ task.title }}
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row justify-between items-center" @click="tasksStore.goEditTask(task)">
        <div class="text-gray-500 text-sm">{{ uiStore.formatDate(task.endDate) }}</div>
        <PriorityTag :priority="task.priority" />
      </div>
    </template>
  </Card>
</template>
