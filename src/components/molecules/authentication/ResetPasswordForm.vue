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
import { toTypedSchema } from '@vee-validate/zod';
import { zxcvbn } from '@zxcvbn-ts/core';
import { useForm } from 'vee-validate';
import { onMounted } from 'vue';
import { onUnmounted } from 'vue';
import { ref } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';
import * as z from 'zod';

const route = useRoute();
const token = ref<string | null>(null);
const authMachine = useAuthMachine();
const authStore = useAuthStore();
const useZxcvbn = (password?: string) => {
  if (password == undefined) return 0;

  return zxcvbn(password).score;
};
const { t } = useI18n();
const formSchema = toTypedSchema(
  z
    .object({
      password: z
        .string({
          error: () => t('auth.resetPassword.form.validation.password'),
        })
        .min(6, {
          error: () =>
            t('auth.resetPassword.form.validation.passwordMinLength'),
        })
        .max(32, {
          error: () =>
            t('auth.resetPassword.form.validation.passwordMaxLength'),
        })
        .refine(
          (password) => {
            const score = useZxcvbn(password);
            return score >= 3;
          },
          {
            error: () =>
              t('auth.resetPassword.form.validation.passwordStrength'),
          },
        ),
      confirmPassword: z
        .string({
          error: () => t('auth.resetPassword.form.validation.password'),
        })
        .min(6, {
          error: () =>
            t('auth.resetPassword.form.validation.passwordMinLength'),
        })
        .max(32, {
          error: () =>
            t('auth.resetPassword.form.validation.passwordMaxLength'),
        }),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: t('auth.resetPassword.form.validation.passwordMatch'),
          path: ['confirmPassword'],
        });
      }
    }),
);
const { handleSubmit, handleReset, isFieldDirty, values } = useForm({
  validationSchema: formSchema,
});
const passwordScore = computed(() => useZxcvbn(values.password));
const getStrengthColor = (level: number) => {
  const colors = {
    1: 'bg-gradient-to-r from-red-500 to-red-400',
    2: 'bg-gradient-to-r from-amber-500 to-orange-400',
    3: 'bg-gradient-to-r from-blue-500 to-violet-400',
    4: 'bg-gradient-to-r from-cyan-400 to-blue-400',
  };
  return colors[level as keyof typeof colors] || 'bg-muted';
};

const handleSignup = handleSubmit(async (values) => {
  const success = await authStore.resetPassword(
    token.value ?? '',
    values.password,
  );

  if (!success) return;

  toast(t('auth.resetPassword.toast.title'), {
    description: t('auth.resetPassword.toast.description'),
  });
});

onMounted(() => {
  if (
    (!route.query.type && !route.query.token)
    || route.query.type !== 'password_reset'
  ) {
    handleReset();
    authMachine.actor.send({ type: 'LOGIN' });
  }

  token.value = (route.query.token as string) || null;
});

onUnmounted(() => {
  handleReset();
});
</script>
<template>
  <form class="flex flex-col gap-6" @submit="handleSignup">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold">
        {{ t('auth.resetPassword.form.title') }}
      </h1>
      <p class="text-muted-foreground text-sm text-balance">
        {{ t('auth.resetPassword.form.subtitle') }}
      </p>
    </div>
    <div class="grid gap-6">
      <div class="grid gap-3">
        <FormField
          v-slot="{ componentField }"
          name="password"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate class="w-full">
            <FormLabel>
              {{ t('auth.resetPassword.form.passwordLabel') }}
            </FormLabel>
            <FormControl>
              <Input type="password" v-bind="componentField" />
            </FormControl>
            <div class="w-full flex justify-evenly gap-2 mt-2">
              <span
                v-for="i of 4"
                :key="i"
                class="flex-1 h-2 rounded-lg border relative overflow-hidden"
              >
                <span
                  class="absolute inset-0 rounded-lg transition-transform duration-300 ease-out origin-left"
                  :class="[
                    i <= passwordScore ? 'scale-x-100' : 'scale-x-0',
                    getStrengthColor(i),
                  ]"
                ></span>
              </span>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <div class="grid gap-3">
        <FormField
          v-slot="{ componentField }"
          name="confirmPassword"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate class="w-full">
            <FormLabel>
              {{ t('auth.resetPassword.form.confirmPasswordLabel') }}
            </FormLabel>
            <FormControl>
              <Input type="password" v-bind="componentField" />
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
      <Button type="submit" class="w-full">{{
        t('auth.resetPassword.form.submitButton')
      }}</Button>
    </div>
  </form>
</template>
