<script lang="ts" setup>
import { Button } from '@/components/atoms/button';
import { useAuthMachine } from '@/machines/auth.machine';
import { useAuthStore } from '@/stores/auth.stores';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/atoms/form';
import { Input } from '@components/atoms/input';
import { Icon } from '@iconify/vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import * as z from 'zod';

const authMachine = useAuthMachine();
const authStore = useAuthStore();
const { t } = useI18n();
const formSchema = toTypedSchema(
  z.object({
    email: z
      .email({ error: () => t('auth.login.form.validation.email') })
      .min(2, { error: () => t('auth.login.form.validation.emailMinLength') })
      .max(250, {
        error: () => t('auth.login.form.validation.emailMaxLength'),
      }),
    password: z
      .string({ error: () => t('auth.login.form.validation.password') })
      .min(6, {
        error: () => t('auth.login.form.validation.passwordMinLength'),
      })
      .max(32, {
        error: () => t('auth.login.form.validation.passwordMaxLength'),
      }),
  }),
);
const { handleSubmit, handleReset, isFieldDirty, meta } = useForm({
  validationSchema: formSchema,
});

const handleLogin = handleSubmit(async (values) => {
  await authStore.login({ email: values.email, password: values.password });
});

const isLoading = computed(() => {
  return authMachine.state.matches('form.loading');
});

onUnmounted(() => {
  handleReset();
});
</script>
<template>
  <form class="flex flex-col gap-6" @submit="handleLogin">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold">{{ t('auth.login.form.title') }}</h1>
      <p class="text-muted-foreground text-sm text-balance">
        {{ t('auth.login.form.subtitle') }}
      </p>
    </div>
    <div class="grid gap-6">
      <div class="grid gap-3">
        <FormField
          v-slot="{ componentField }"
          name="email"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('auth.login.form.emailLabel') }}
            </FormLabel>
            <FormControl>
              <Input
                tabindex="1"
                type="email"
                placeholder="john.doe@example.com"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <div class="grid gap-3">
        <FormField
          v-slot="{ componentField }"
          name="password"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate class="w-full">
            <div class="flex items-center">
              <FormLabel>
                {{ t('auth.login.form.passwordLabel') }}
              </FormLabel>
              <RouterLink
                tabindex="5"
                class="ml-auto text-sm underline-offset-4 hover:underline"
                :to="{ name: 'login' }"
              >
                {{ t('auth.login.form.passwordForgotten') }}
              </RouterLink>
            </div>
            <FormControl>
              <Input
                tabindex="2"
                type="password"
                v-bind="componentField"
                :placeholder="t('auth.login.form.passwordLabel')"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <span
        v-if="authStore.authError"
        class="text-destructive-foreground text-sm"
        >{{ authStore.authError }}</span
      >
      <Button
        tabindex="3"
        type="submit"
        class="w-full"
        :disabled="!meta.valid || isLoading"
      >
        <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
        <span v-else>{{ t('auth.login.form.loginButton') }}</span>
      </Button>
    </div>
    <RouterLink
      tabindex="4"
      :to="{ name: 'signup' }"
      class="text-center text-sm hover:underline hover:underline-offset-4"
    >
      {{ t('auth.login.form.noAccountLink') }}
    </RouterLink>
  </form>
</template>
