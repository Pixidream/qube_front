<script setup lang="ts">
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
import { toast } from 'vue-sonner';
import * as z from 'zod';

const authMachine = useAuthMachine();
const authStore = useAuthStore();
const { t } = useI18n();
const formSchema = toTypedSchema(
  z.object({
    email: z
      .email({ error: () => t('auth.sendResetPassword.form.validation.email') })
      .min(2, {
        error: () => t('auth.sendResetPassword.form.validation.emailMinLength'),
      })
      .max(250, {
        error: () => t('auth.sendResetPassword.form.validation.emailMaxLength'),
      }),
  }),
);
const { handleSubmit, handleReset, isFieldDirty, meta } = useForm({
  validationSchema: formSchema,
});

const handleLogin = handleSubmit(async (values) => {
  const success = await authStore.sendResetPassword(values.email);

  if (!success) return;

  toast(t('auth.sendResetPassword.toast.title'), {
    description: t('auth.sendResetPassword.toast.description'),
  });
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
      <h1 class="text-2xl font-bold">
        {{ t('auth.sendResetPassword.form.title') }}
      </h1>
      <p class="text-muted-foreground text-sm text-balance">
        {{ t('auth.sendResetPassword.form.subtitle') }}
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
              {{ t('auth.sendResetPassword.form.emailLabel') }}
            </FormLabel>
            <FormControl>
              <Input
                tabindex="1"
                type="email"
                placeholder="john.doe@example.com"
                v-bind="componentField"
                @keydown.enter="handleLogin"
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
        <span v-else>{{ t('auth.sendResetPassword.form.submitButton') }}</span>
      </Button>
    </div>
  </form>
</template>
