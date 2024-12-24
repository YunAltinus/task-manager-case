<script setup>
import { ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useToast } from "primevue/usetoast";
import { Form } from "@primevue/forms";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { useRouter } from "vue-router";

import {
  Card,
  InputText,
  Password,
  Button,
  Message,
  FloatLabel,
} from "primevue";

const authStore = useAuthStore();
const uiStore = useUiStore();
const toast = useToast();
const router = useRouter();

const resolver = ref(
  zodResolver(
    z
      .object({
        email: z
          .string()
          .email({ message: "Geçerli bir e-posta adresi giriniz." })
          .nonempty({ message: "E-posta boş olamaz." }),

        username: z
          .string()
          .min(3, { message: "Kullanıcı adı en az 3 karakter olmalıdır." })
          .max(20, { message: "Kullanıcı adı en fazla 20 karakter olmalıdır." })
          .regex(/^[a-zA-Z0-9_]+$/, {
            message:
              "Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.",
          })
          .nonempty({ message: "Kullanıcı adı boş olamaz." }),

        name: z
          .string()
          .min(2, { message: "Ad en az 2 karakter olmalıdır." })
          .max(50, { message: "Ad en fazla 50 karakter olmalıdır." })
          .nonempty({ message: "Ad boş olamaz." }),

        surname: z
          .string()
          .min(2, { message: "Soyad en az 2 karakter olmalıdır." })
          .max(50, { message: "Soyad en fazla 50 karakter olmalıdır." })
          .nonempty({ message: "Soyad boş olamaz." }),

        password: z
          .string()
          .min(8, { message: "Şifre en az 8 karakter olmalıdır." })
          .max(20, { message: "Şifre en fazla 20 karakter olmalıdır." })
          .regex(/[a-z]/, { message: "Şifre küçük harf içermelidir." })
          .regex(/[A-Z]/, { message: "Şifre büyük harf içermelidir." })
          .regex(/\d/, { message: "Şifre rakam içermelidir." })
          .nonempty({ message: "Şifre boş olamaz." }),

        confirmPassword: z
          .string()
          .nonempty({ message: "Şifre tekrarı boş olamaz." }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Şifreler eşleşmiyor.",
        path: ["confirmPassword"],
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
  }

  try {
    uiStore.isLoading = true;

    await authStore.register();
    toast.add({
      severity: "success",
      summary: "Kayıt Başarılı",
      detail: "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
      life: 3000,
    });

    setTimeout(() => {
      // router.push({ name: "login" });
      window.location.href = "/login";
    })
  } catch (error) {
    console.log(error.response);

    toast.add({
      severity: "error",
      summary: "Kayıt Başarısız",
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
      <template #title> Kayıt </template>
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
                  v-model="authStore.registerUserInformation.email"
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
                <InputText
                  v-model="authStore.registerUserInformation.username"
                  id="username"
                  name="username"
                  fluid
                />
                <label for="username">Kullanıcı Adı</label>
              </FloatLabel>
              <template v-if="$form.username?.invalid">
                <Message
                  v-for="(error, index) of $form.username.errors"
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
                  v-model="authStore.registerUserInformation.password"
                  name="password"
                  :feedback="true"
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
            <div class="flex flex-col gap-1 w-full">
              <FloatLabel variant="on" class="mt-2">
                <Password
                  name="confirmPassword"
                  :feedback="true"
                  fluid
                  toggleMask
                />
                <label for="confirmPassword">Şifre Tekrarı</label>
              </FloatLabel>
              <template v-if="$form.confirmPassword?.invalid">
                <Message
                  v-for="(error, index) of $form.confirmPassword.errors"
                  :key="index"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ error.message }}</Message
                >
              </template>
            </div>
            <Button
              :loading="uiStore.isLoading"
              type="submit"
              label="Kayıt Ol"
              severity="secondary"
              class="mt-2"
              fluid
            />
          </Form>
        </div>
      </template>
      <template #footer>
        <div class="w-full flex items-center justify-center">
          Hesabınız var mı?
          <RouterLink to="/login" class="text-emphasis hover:bg-inherit"
            >Giriş yapın.</RouterLink
          >
        </div>
      </template>
    </Card>
  </div>
</template>
