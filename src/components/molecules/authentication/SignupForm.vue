<script lang="ts" setup>
import { Button } from '@/components/atoms/button';
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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import * as z from 'zod';

const authStore = useAuthStore();
const useZxcvbn = (password?: string) => {
  if (password == undefined) return 0;

  return zxcvbn(password).score;
};
const { t } = useI18n();
const formSchema = toTypedSchema(
  z
    .object({
      email: z
        .string({ error: () => t('auth.signup.form.validation.email') })
        .min(2, {
          error: () => t('auth.signup.form.validation.emailMinLength'),
        })
        .max(250, {
          error: () => t('auth.signup.form.validation.emailMaxLength'),
        }),
      password: z
        .string({ error: () => t('auth.signup.form.validation.password') })
        .min(6, {
          error: () => t('auth.signup.form.validation.passwordMinLength'),
        })
        .max(32, {
          error: () => t('auth.signup.form.validation.passwordMaxLength'),
        })
        .refine(
          (password) => {
            const score = useZxcvbn(password);
            return score >= 3;
          },
          { error: () => t('auth.signup.form.validation.passwordStrength') },
        ),
      confirmPassword: z
        .string({ error: () => t('auth.signup.form.validation.password') })
        .min(6, {
          error: () => t('auth.signup.form.validation.passwordMinLength'),
        })
        .max(32, {
          error: () => t('auth.signup.form.validation.passwordMaxLength'),
        }),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: t('auth.signup.form.validation.passwordMatch'),
          path: ['confirmPassword'],
        });
      }
    }),
);
const { handleSubmit, isFieldDirty, values } = useForm({
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

const handleSignup = handleSubmit((values) => {
  console.log('signup form submitted !', values);
});
</script>
<template>
  <form class="flex flex-col gap-6" @submit="handleSignup">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold">{{ t('auth.signup.form.title') }}</h1>
      <p class="text-muted-foreground text-sm text-balance">
        {{ t('auth.signup.form.subtitle') }}
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
              {{ t('auth.signup.form.emailLabel') }}
            </FormLabel>
            <FormControl>
              <Input
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
            <FormLabel>
              {{ t('auth.signup.form.passwordLabel') }}
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
              {{ t('auth.signup.form.confirmPasswordLabel') }}
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
        t('auth.signup.form.signupButton')
      }}</Button>
    </div>
    <RouterLink
      :to="{ name: 'login' }"
      class="text-center text-sm hover:underline hover:underline-offset-4"
    >
      {{ t('auth.signup.form.haveAccountLink') }}
    </RouterLink>
  </form>
</template>
