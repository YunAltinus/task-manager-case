<script setup>
import { ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useToast } from "primevue/usetoast";
import { Form } from "@primevue/forms";
import {
  Card,
  InputText,
  Password,
  Button,
  Message,
  FloatLabel,
} from "primevue";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import router from "@/router";

const uiStore = useUiStore();
const authStore = useAuthStore();
const toast = useToast();
const initialValues = ref({
  email: "",
  password: "",
});

const resolver = ref(
  zodResolver(
    z.object({
      email: z
        .string()
        .email({ message: "Geçerli bir e-posta adresi giriniz." }),
      password: z
        .string()
        .min(3, { message: "Şifre en az 3 karakter olmalıdır." })
        .refine((value) => /[a-z]/.test(value), {
          message: "Şifre küçük harf içermelidir.",
        })
        .refine((value) => /[A-Z]/.test(value), {
          message: "Şifre büyük harf içermelidir.",
        })
        .refine((value) => /\d/.test(value), {
          message: "Şifre rakam içermelidir.",
        }),
    })
  )
);

const onFormSubmit = async ({ valid }) => {
  if (!valid) {
    toast.add({
      severity: "error",
      summary: "Form Hatalı",
      detail: "Lütfen hataları düzeltin.",
      life: 3000,
    });

    return;
  }
  try {
    uiStore.isLoading = true;

    const { data } = await authStore.login();
    toast.add({
      severity: "success",
      summary: "Giriş Başarılı",
      detail: "Giriş başarılı, yönlendiriliyorsunuz.",
      life: 2000,
    });

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    setTimeout(() => {
      // router.push({ name: "tasks" });
      window.location.href = "/tasks";
    }, 2000);
  } catch (error) {
    console.log(error.response);

    toast.add({
      severity: "error",
      summary: "Giriş Başarısız",
      detail: error.response.data.message,
      life: 3000,
    });
  } finally {
    uiStore.isLoading = false;
  }
};
</script>

<template>
  <div class="container mx-auto h-auto my-9 flex items-center justify-center">
    <Card style="width: 25rem; overflow: hidden">
      <template #title> Giriş </template>
      <template #content>
        <div class="flex flex-col items-center">
          <Form
            v-slot="$form"
            :resolver
            :initialValues
            @submit="onFormSubmit"
            class="w-full flex flex-col items-center justify-center gap-3"
          >
            <div class="flex flex-col gap-1 w-full">
              <FloatLabel variant="on" class="mt-2">
                <InputText
                  v-model="authStore.loginUserInformation.email"
                  id="email"
                  name="email"
                  autofocus
                  fluid
                />
                <label for="email">E-Posta</label>
              </FloatLabel>
              <template v-if="$form.email?.invalid">
                <Message
                  v-for="(error, index) of $form.email.errors"
                  :key="index"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ error.message }}</Message
                >
              </template>
            </div>
            <div class="flex flex-col gap-1 w-full">
              <FloatLabel variant="on" class="mt-2">
                <Password
                  v-model="authStore.loginUserInformation.password"
                  name="password"
                  :feedback="false"
                  fluid
                  toggleMask
                />
                <label for="email">Şifre</label>
              </FloatLabel>
              <template v-if="$form.password?.invalid">
                <Message
                  v-for="(error, index) of $form.password.errors"
                  :key="index"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ error.message }}</Message
                >
              </template>
            </div>
            <Button
              type="submit"
              label="Giriş Yap"
              severity="secondary"
              fluid
              class="mt-2"
              :loading="uiStore.isLoading"
            />
          </Form>
        </div>
      </template>
      <template #footer>
        <div class="w-full flex items-center justify-center">
          Hesabınız yok mu?
          <RouterLink to="/register" class="text-emphasis hover:bg-inherit"
            >Kayıt olun.</RouterLink
          >
        </div>
      </template>
    </Card>
  </div>
</template>
