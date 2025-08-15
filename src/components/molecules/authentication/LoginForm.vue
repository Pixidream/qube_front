<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useForm } from 'vee-validate';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@components/atoms/form';
import { Input } from '@components/atoms/input';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import { Button } from '@/components/atoms/button';

const { t } = useI18n();
const formSchema = toTypedSchema(
  z.object({
    email: z
      .string({ error: () => t('auth.login.form.validation.email') })
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
const { handleSubmit, isFieldDirty } = useForm({
  validationSchema: formSchema,
});

const handleLogin = handleSubmit((values) => {
  console.log('login form submitted !', values);
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
                class="ml-auto text-sm underline-offset-4 hover:underline"
                :to="{ name: 'login' }"
              >
                {{ t('auth.login.form.passwordForgotten') }}
              </RouterLink>
            </div>
            <FormControl>
              <Input type="password" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <Button type="submit" class="w-full">{{
        t('auth.login.form.loginButton')
      }}</Button>
    </div>
    <RouterLink
      :to="{ name: 'signup' }"
      class="text-center text-sm hover:underline hover:underline-offset-4"
    >
      {{ t('auth.login.form.noAccountLink') }}
    </RouterLink>
  </form>
</template>
