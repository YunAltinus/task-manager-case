<script setup>
import { ref, onMounted } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { Form } from "@primevue/forms";
import {
  InputText,
  Message,
  useToast,
  DatePicker,
  FileUpload,
  Badge,
  Button,
} from "primevue";
import { usePrimeVue } from "primevue/config";
import Editor from "primevue/editor";
import { useTasksStore } from "@/stores/tasks";
import PriorityTag from "./priorityTag.vue";
import LightGallery from "./lightGallery.vue";
import showFile from "./showFile.vue";

const $primevue = usePrimeVue();
const tasksStore = useTasksStore();
const toast = useToast();

const formRef = ref(null);
const files = ref([]);

const initialValues = ref({
  title: tasksStore.selectedTask?.title ?? "",
  description: tasksStore.selectedTask?.description ?? "",
  priority: tasksStore.selectedTask?.priority ?? "medium",
  endDate: tasksStore.selectedTask?.endDate ?? new Date(),
  files: tasksStore.selectedTask?.files ?? [],
});

const resolver = ref(
  zodResolver(
    z.object({
      title: z.string().nonempty("Başlık boş olamaz"),
      description: z.string().nonempty("Açıklama boş olamaz"),
      priority: z.string().nonempty("Öncelik boş olamaz"),
    })
  )
);

function formatDateToMySQL(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const onFormSubmit = async () => {
  try {
    if (files.value.length > 0) {
      // FormData oluştur ve dosyaları ekle
      const formData = new FormData();
      formData.append("title", tasksStore.task.title);
      formData.append("description", tasksStore.task.description);
      formData.append("priority", tasksStore.task.priority);
      formData.append("status", tasksStore.task.status || "notStarted");
      formData.append("endDate", formatDateToMySQL(tasksStore.task.endDate));
      formData.append("q", tasksStore.task.q);

      files.value.forEach((file) => {
        formData.append("files", file); // Binary dosya ekle
      });
      console.log("formData", formData);
      // FormData ile gönder
      await tasksStore.createTask(formData, true); // FormData gönderimi
    } else {
      // JSON formatında gönder
      const taskData = {
        title: tasksStore.task.title,
        description: tasksStore.task.description,
        priority: tasksStore.task.priority,
        status: tasksStore.task.status || "notStarted",
        endDate: formatDateToMySQL(tasksStore.task.endDate),
        q: tasksStore.task.q,
      };

      // JSON ile gönder
      await tasksStore.createTask(taskData, false); // JSON gönderimi
    }

    toast.add({
      severity: "success",
      summary: "Başarılı",
      detail: "Görev başarıyla eklendi",
      life: 3000,
    });
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Hata",
      detail: "Görev eklenirken bir hata oluştu",
      life: 3000,
    });
  }
};

const submitTask = () => {
  const form = formRef.value;
  if (form) {
    form.validate(); // Formu manuel olarak doğrulayabilirsiniz
  }
};

const totalSize = ref(0);
const totalSizePercent = ref(0);

const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
  removeFileCallback(index);
  totalSize.value -= parseInt(formatSize(file.size));
  totalSizePercent.value = totalSize.value / 10;
};

const onClearTemplatingUpload = (clear) => {
  clear();
  totalSize.value = 0;
  totalSizePercent.value = 0;
};

const onSelectedFiles = (event) => {
  files.value = event.files;
  files.value.forEach((file) => {
    totalSize.value += parseInt(formatSize(file.size));
  });
};

const uploadEvent = (callback) => {
  totalSizePercent.value = totalSize.value / 10;
  callback();
};

const onTemplatedUpload = () => {
  toast.add({
    severity: "info",
    summary: "Success",
    detail: "File Uploaded",
    life: 3000,
  });
};

const formatSize = (bytes) => {
  const k = 1024;
  const dm = 3;
  const sizes = $primevue.config.locale.fileSizeTypes;

  if (bytes === 0) {
    return `0 ${sizes[0]}`;
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${formattedSize} ${sizes[i]}`;
};
</script>

<template>
  <div class="flex flex-col md:flex-row gap-4 w-full">
    <div class="flex-1">
      <Form
        ref="formRef"
        v-slot="$form"
        :resolver
        @submit="onFormSubmit"
        class="w-full flex flex-col items-center justify-center gap-3"
      >
        <div class="flex flex-col gap-1 w-full">
          <label for="title"
            >Başlık <span class="text-red-500 text-sm">*</span></label
          >
          <InputText
            v-model="tasksStore.task.title"
            id="title"
            name="title"
            autofocus
            fluid
          />

          <template v-if="$form.title?.invalid">
            <Message
              v-for="(error, index) of $form.title.errors"
              :key="index"
              severity="error"
              size="small"
              variant="simple"
              >{{ error.message }}</Message
            >
          </template>
        </div>

        <div class="flex flex-col gap-1 w-full">
          <label for="description"
            >Açıklama <span class="text-red-500 text-sm">*</span></label
          >
          <Editor
            v-model="tasksStore.task.description"
            name="description"
            editorStyle="height: auto;"
          />

          <template v-if="$form.description?.invalid">
            <Message
              v-for="(error, index) of $form.description.errors"
              :key="index"
              severity="error"
              size="small"
              variant="simple"
              >{{ error.message }}</Message
            >
          </template>
        </div>

        <div class="flex flex-col md:flex-row justify-between w-full gap-4">
          <div class="flex flex-col gap-1">
            <label for="endDate"
              >Son Tarih <span class="text-red-500 text-sm">*</span></label
            >
            <DatePicker
              v-model="tasksStore.task.endDate"
              name="endDate"
              dateFormat="yy-mm-dd"
            />

            <template v-if="$form.endDate?.invalid">
              <Message
                v-for="(error, index) of $form.endDate.errors"
                :key="index"
                severity="error"
                size="small"
                variant="simple"
                >{{ error.message }}</Message
              >
            </template>
          </div>
          <div class="flex flex-col gap-1">
            <label for="priority">
              Kişi Ata <span class="text-red-500 text-sm">*</span>
            </label>
          </div>

          <div class="flex flex-col gap-1">
            <label for="priority"
              >Öncelik <span class="text-red-500 text-sm">*</span></label
            >
            <div class="flex flex-row gap-1">
              <template v-for="priority in ['high', 'medium', 'low']">
                <div
                  :class="[
                    tasksStore.task.priority === priority &&
                      'border border-gray-500 rounded-lg',
                  ]"
                >
                  <PriorityTag
                    :priority
                    @click="tasksStore.task.priority = priority"
                  />
                </div>
              </template>
            </div>

            <template v-if="$form.priority?.invalid">
              <Message
                v-for="(error, index) of $form.priority.errors"
                :key="index"
                severity="error"
                size="small"
                variant="simple"
                >{{ error.message }}</Message
              >
            </template>
          </div>
        </div>
        <div class="mt-6 w-full">
          <Button fluid type="submit">
            KAYDET
            <!-- <template v-if="tasksStore">Kaydet</template> -->
          </Button>
        </div>
      </Form>
    </div>
    <div class="flex-1">
      <label for="priority">Görev Dosyaları</label>
      <FileUpload
        name="files[]"
        @upload="onTemplatedUpload($event)"
        @select="onSelectedFiles"
        :multiple="true"
        accept="image/*,video/mp4,application/pdf"
        :maxFileSize="10000000"
        uploadLabel="Dosya Yükle"
        cancelLabel="Temizle"
        chooseLabel="Seç"
        mode="advanced"
      >
        <template
          #content="{
            files,
            uploadedFiles,
            removeUploadedFileCallback,
            removeFileCallback,
            messages,
          }"
        >
          <div class="flex flex-col gap-8 pt-4">
            <Message
              v-for="message of messages"
              :key="message"
              :class="{ 'mb-8': !files.length && !uploadedFiles.length }"
              severity="error"
            >
              {{ message }}
            </Message>

            <div v-if="files.length > 0">
              <h5>Bekleyenler</h5>
              <div class="flex flex-col gap-4">
                <div
                  v-for="(file, index) of files"
                  :key="file.name + file.type + file.size"
                  class="flex flex-row justify-between items-center p-2 rounded-border border border-surface gap-4"
                >
                  <div>
                    <template v-if="file.type.includes('image/')">
                      <img
                        role="presentation"
                        :alt="file.name"
                        :src="file.objectURL"
                        width="50"
                        height="50"
                      />
                    </template>
                    <template v-else-if="file.type.includes('video/')">
                      <i class="pi pi-video" style="font-size: 3rem"></i>
                    </template>
                    <template v-else>
                      <i
                        class="pi pi-file-pdf"
                        style="font-size: 3rem; color: red"
                      ></i>
                    </template>
                  </div>
                  <span
                    class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                  >
                    {{ file.name }}</span
                  >
                  <div class="flex flex-col gap-1">
                    {{ formatSize(file.size) }}
                    <Badge value="Pending" severity="warn" />
                  </div>
                  <div class="flex flex-row gap-1">
                    <Button
                      icon="pi pi-times"
                      @click="
                        onRemoveTemplatingFile(file, removeFileCallback, index)
                      "
                      outlined
                      rounded
                      severity="danger"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="uploadedFiles.length > 0">
              <h5>Yüklenenler</h5>
              <LightGallery ref="gallery" class="flex flex-col gap-4">
                <div
                  v-for="(file, index) of uploadedFiles"
                  :key="file.name + file.type + file.size"
                  class="flex flex-row justify-between items-center p-2 rounded-border border border-surface gap-4"
                >
                  <template v-if="file.type.includes('image/')">
                    <a :href="file.objectURL" data-lg-size="800-600">
                      <img
                        role="presentation"
                        :alt="file.name"
                        :src="file.objectURL"
                        width="50"
                        height="50"
                      />
                    </a>
                  </template>
                  <template v-else-if="file.type.includes('video/')">
                    <a :href="file.objectURL" data-video="true">
                      <i class="pi pi-video" style="font-size: 3rem"></i>
                    </a>
                  </template>
                  <template v-else-if="file.type.includes('application/pdf')">
                    <a :data-src="file.objectURL" data-iframe="true">
                      <i
                        class="pi pi-file-pdf"
                        style="font-size: 3rem; color: red"
                      ></i>
                    </a>
                  </template>
                  <span
                    class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                  >
                    {{ file.name }}
                  </span>
                  <div class="flex flex-col gap-1">
                    {{ formatSize(file.size) }}
                    <Badge value="Completed" severity="success" />
                  </div>
                  <div class="flex flex-row gap-1">
                    <Button
                      icon="pi pi-times"
                      @click="removeUploadedFileCallback(index)"
                      outlined
                      rounded
                      severity="danger"
                    />
                  </div>
                </div>
              </LightGallery>
            </div>
          </div>
        </template>
        <template #empty>
          <span>Dosyaları buraya sürükleyip bırakın.</span>
        </template>
      </FileUpload>
      <div>
        <showFile />
      </div>
    </div>
  </div>
</template>
