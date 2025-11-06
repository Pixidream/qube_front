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
import { computed, onMounted, onUnmounted, watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as z from 'zod';
import { createComponentLogger } from '@/utils/logger';
import { MIN_EXEC_TIME_MS } from '@/core/constants/auth.constants';
import { toast } from 'vue-sonner';

// Create component-specific logger
const loginLogger = createComponentLogger('LoginForm');

const authMachine = useAuthMachine();
const authStore = useAuthStore();
const { t } = useI18n();
const sendingVerifyLink = ref(false);

loginLogger.debug('Initializing login form component');
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
const {
  handleSubmit,
  handleReset,
  isFieldDirty,
  meta,
  errors,
  values,
  isFieldValid,
} = useForm({
  validationSchema: formSchema,
});

const handleLogin = handleSubmit(async (values) => {
  loginLogger.info('Login form submission started', {
    action: 'form_submit',
    email: values.email,
    hasPassword: !!values.password,
    formValid: meta.value.valid,
  });

  try {
    await authStore.login({ email: values.email, password: values.password });
    loginLogger.info('Login form submission completed', {
      action: 'form_submit_complete',
      email: values.email,
    });
  } catch (error) {
    loginLogger.error('Login form submission failed', error as Error, {
      action: 'form_submit_error',
      email: values.email,
    });
  }
});

const handleResendVerificationLink = async () => {
  sendingVerifyLink.value = true;
  await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));
  if (!values.email) return;
  if (!isFieldValid('email')) return;

  try {
    await authStore.resendVerificationEmail(values.email);
    authStore.authErrorCode = null;
  } catch {
    toast.error('Failed to send a new email. Please try again');
  } finally {
    sendingVerifyLink.value = false;
  }
};

const isLoading = computed(() => {
  return authMachine.state.matches('form.loading');
});

// Watch for form validation errors
watch(
  () => errors.value,
  (newErrors) => {
    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      loginLogger.debug('Form validation errors detected', {
        action: 'form_validation_errors',
        errorFields,
        errorCount: errorFields.length,
      });
    }
  },
  { deep: true },
);

// Watch for authentication errors
watch(
  () => authStore.authError,
  (newError, oldError) => {
    if (newError && newError !== oldError) {
      loginLogger.warn('Authentication error displayed to user', {
        action: 'auth_error_display',
        error: newError,
        email: values.email,
      });
    }
  },
);

// Watch for loading state changes
watch(
  () => isLoading.value,
  (newLoading, oldLoading) => {
    if (newLoading !== oldLoading) {
      loginLogger.debug('Login form loading state changed', {
        action: 'loading_state_change',
        isLoading: newLoading,
        email: values.email,
      });
    }
  },
);

onMounted(() => {
  loginLogger.info('Login form component mounted', {
    action: 'component_mounted',
  });
});

onUnmounted(() => {
  loginLogger.debug('Login form component unmounting', {
    action: 'component_unmount',
  });
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
              <a
                tabindex="5"
                class="ml-auto text-sm cursor-pointer underline-offset-4 hover:underline"
                @click.prevent="
                  authMachine.actor.send({ type: 'RESET_PASSWORD' })
                "
              >
                {{ t('auth.login.form.passwordForgotten') }}
              </a>
            </div>
            <FormControl>
              <Input
                tabindex="2"
                type="password"
                v-bind="componentField"
                :placeholder="t('auth.login.form.passwordLabel')"
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
      <div v-if="authStore.authErrorCode === 422" class="flex flex-col gap-2">
        <span class="text-sm text-destructive-foreground">{{
          t('auth.login.emailNotVerified')
        }}</span>
        <Icon v-if="sendingVerifyLink" icon="svg-spinners:ring-resize" />
        <span
          v-else
          class="text-sm cursor-pointer underline"
          @click="handleResendVerificationLink"
          >{{ t('auth.login.emailNotVerifiedLink') }}</span
        >
      </div>
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
    <a
      tabindex="4"
      class="text-center text-sm hover:underline hover:underline-offset-4"
      @click.prevent="authMachine.actor.send({ type: 'SIGNUP' })"
    >
      {{ t('auth.login.form.noAccountLink') }}
    </a>
  </form>
</template>
