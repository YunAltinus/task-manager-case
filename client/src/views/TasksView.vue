<script setup>
import { ref, onMounted } from "vue";
import { useTasksStore } from "@/stores/tasks";
import { Card, Dialog, Button, Select } from "primevue";
import { useToast } from "primevue/usetoast";
import draggable from "vuedraggable";
import TaskCard from "@/components/tasks/taskCard.vue";
import TaskForm from "@/components/tasks/taskForm.vue";
import TaskSearch from "@/components/tasks/taskSearch.vue";

const tasksStore = useTasksStore();
const toast = useToast();

const addTask = async (task) => {
  await tasksStore.addTask(task);
};

const log = async (event) => {
  if (event.added) {
    console.log(event);
    await tasksStore.updateTask({
      q: event.added.newIndex,
      id: event.added.element.id,
      status:
        event.added.element.status === "notStarted"
          ? "completed"
          : "notStarted",
    });
  }
  //   await tasksStore.updateTask(event);
};

const setAttachmentUser = () => {
  if (tasksStore.task.assignedTo === null) {
    toast.add({
      severity: "error",
      summary: "Kişi Seçilmedi",
      detail: "Görevi ekleyeceğiniz kişiyi seçiniz.",
      life: 3000,
    });
  }

  console.log("if sonrası");
  const response = tasksStore.setAttachmentUser();
  if (response) {
    toast.add({
      severity: "success",
      summary: "Kişi Atandı",
      detail: "Görevi ekleyeceğiniz kişi başarıyla atandı.",
      life: 3000,
    });
  }
};

onMounted(async () => {
  await tasksStore.fetchTasks();
  await tasksStore.fetchUsers();
});
</script>

<template>
  <div class="container mx-auto h-auto my-9 flex justify-center gap-4">
    <Card class="h-[22rem]" style="width: 20rem; overflow: hidden">
      <template #title>
        <div class="flex justify-between text-center items-center h-10">
          <span>Görev Ara</span>
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            variant="text"
            rounded
            class="p-0"
            @click="tasksStore.searchReset()"
          />
        </div>
      </template>
      <template #content>
        <div class="flex flex-col items-center overflow-y-auto custom-scroll">
          <TaskSearch />
        </div>
      </template>
    </Card>

    <Card style="width: 25rem; overflow: hidden">
      <template #title>
        <div class="flex justify-between text-center items-center h-10">
          <span>Yapılacak Görevler</span>
          <Button
            icon="pi pi-plus"
            severity="secondary"
            variant="text"
            rounded
            class="p-0"
            @click="tasksStore.visibleEditTaskDialog = true"
          />
        </div>
      </template>
      <template #content>
        <div
          class="flex flex-col items-center overflow-y-auto h-[42rem] custom-scroll"
        >
          <draggable
            class="w-full h-full flex flex-col items-center gap-2"
            :list="tasksStore.notStartedTasks"
            group="tasks"
            @change="log"
            itemKey="id"
          >
            <template #item="{ element, index }">
              <TaskCard :task="element" />
            </template>
          </draggable>
        </div>
      </template>
    </Card>

    <Card style="width: 25rem; overflow: hidden">
      <template #title>
        <div class="flex justify-between text-center items-center h-10">
          <span>Tamamlanan Görevler</span>
        </div>
      </template>
      <template #content>
        <div
          class="flex flex-col items-center overflow-y-auto h-[42rem] custom-scroll"
        >
          <draggable
            class="w-full h-full flex flex-col items-center gap-2"
            :list="tasksStore.completedTasks"
            group="tasks"
            @change="log"
            itemKey="title"
          >
            <template #item="{ element, index }">
              <TaskCard :task="element" />
            </template>
          </draggable>
        </div>
      </template>
    </Card>

    <Dialog
      v-model:visible="tasksStore.visibleEditTaskDialog"
      baseZIndex="9"
      :autoZIndex="false"
      :visible="tasksStore.visibleEditTaskDialog"
      modal
      @update:visible="
        !$event
          ? [(tasksStore.selectedTask = null), tasksStore.resetTask()]
          : false
      "
      :style="{ width: '80rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <template #header>
        <div class="flex justify-between items-center w-full">
          <h1 class="text-2xl">
            {{ `Görev ${tasksStore.selectedTask ? "Düzenle" : "Ekle"}` }}
          </h1>
          <div class="flex gap-2 items-center">
            <div v-if="tasksStore.task" class="flex flex-col gap-1">
              <Button v-if="tasksStore.task?.assignedTo?.username" label>
                {{ tasksStore.task?.assignedTo?.username }}
              </Button>
            </div>

            <Select
              v-model="tasksStore.task.assignedTo"
              :options="tasksStore.users"
              optionLabel="username"
              optionValue="id"
              placeholder="Kişi Ata"
              class="w-full md:w-56"
              @change="setAttachmentUser"
            />
          </div>
        </div>
      </template>
      <TaskForm />
    </Dialog>
  </div>
</template>
