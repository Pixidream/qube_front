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
import { zxcvbn } from '@zxcvbn-ts/core';
import { useForm } from 'vee-validate';
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as z from 'zod';
import { createComponentLogger } from '@/utils/logger';
import { SignupBody } from '@/core/types/auth';

// Create component-specific logger
const signupLogger = createComponentLogger('SignupForm');

const authMachine = useAuthMachine();
const authStore = useAuthStore();

const useZxcvbn = (password?: string) => {
  if (password == undefined) return 0;

  const result = zxcvbn(password);
  signupLogger.trace('Password strength calculated', {
    action: 'password_strength_check',
    score: result.score,
    hasPassword: !!password,
    passwordLength: password?.length || 0,
  });
  return result.score;
};
const { t } = useI18n();

signupLogger.debug('Initializing signup form schema validation');

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
      username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(
          /^[a-zA-Z0-9_-]+$/,
          'Username can only contain letters, numbers, underscores and hyphens',
        ),
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
            const isValid = score >= 3;
            signupLogger.debug('Password strength validation', {
              action: 'password_validation',
              score,
              isValid,
              requiredScore: 3,
            });
            return isValid;
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
        signupLogger.debug('Password confirmation mismatch', {
          action: 'password_confirm_validation',
          isMatch: false,
        });
        ctx.addIssue({
          code: 'custom',
          message: t('auth.signup.form.validation.passwordMatch'),
          path: ['confirmPassword'],
        });
      } else {
        signupLogger.trace('Password confirmation validated', {
          action: 'password_confirm_validation',
          isMatch: true,
        });
      }
    }),
);
const { handleSubmit, isFieldDirty, values, meta } = useForm({
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
  signupLogger.info('Signup form submission started', {
    action: 'form_submit',
    email: values.email,
    passwordStrength: useZxcvbn(values.password),
  });

  try {
    // Log the attempt before sending to auth machine
    signupLogger.debug('Signup form submission - start', {
      action: 'form_submit_start',
      email: values.email,
    });

    try {
      await authStore.signUp({
        email: values.email,
        username: values.username,
        password: values.password,
      } as SignupBody);
      signupLogger.info('Signup form submission - completed', {
        action: 'form_submit_complete',
        email: values.email,
      });
    } catch (error) {
      signupLogger.error('Signup form submission - failed', error as Error, {
        action: 'form_submit_error',
        email: values.email,
      });
    }
  } catch (error) {
    signupLogger.error('Signup form submission - failed', error as Error, {
      action: 'form_submit_error',
      email: values.email,
    });
  }
});

const isLoading = computed(() => {
  return authMachine.state.matches('form.loading');
});

// Log component mounting
onMounted(() => {
  signupLogger.info('Signup form component mounted', {
    action: 'component_mounted',
  });
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
          name="username"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('auth.signup.form.usernameLabel') }}
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="john.doe"
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
              <Input
                type="password"
                v-bind="componentField"
                @keydown.enter="handleSignup"
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
      <Button type="submit" class="w-full" :disabled="!meta.valid || isLoading">
        <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
        <span v-else>{{ t('auth.signup.form.signupButton') }}</span>
      </Button>
    </div>
    <a
      class="text-center text-sm hover:underline hover:underline-offset-4"
      @click.prevent="authMachine.actor.send({ type: 'LOGIN' })"
    >
      {{ t('auth.signup.form.haveAccountLink') }}
    </a>
  </form>
</template>
