<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.stores';
import { Button } from '@components/atoms/button';
import { DialogFooter } from '@components/atoms/dialog';
import { Icon } from '@iconify/vue';
import { Input } from '@components/atoms/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/atoms/form';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import z from 'zod';
import { ref, computed } from 'vue';
import { toast } from 'vue-sonner';
import { zxcvbn } from '@zxcvbn-ts/core';
import { useAuthMachine } from '@/machines/auth.machine';
import { createComponentLogger } from '@/utils/logger';

// Create component-specific logger
const changePasswordLogger = createComponentLogger('ChangePasswordForm');

const emit = defineEmits<{
  close: [];
}>();

const authStore = useAuthStore();
const authMachine = useAuthMachine();
const { t } = useI18n();

const useZxcvbn = (password?: string) => {
  if (password == undefined) return 0;
  return zxcvbn(password).score;
};

const formSchema = toTypedSchema(
  z
    .object({
      currentPassword: z
        .string({ error: () => t('auth.login.form.validation.password') })
        .min(6, {
          error: () => t('auth.login.form.validation.passwordMinLength'),
        })
        .max(32, {
          error: () => t('auth.login.form.validation.passwordMaxLength'),
        }),
      newPassword: z
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
            return useZxcvbn(password) >= 3;
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
    .superRefine(({ confirmPassword, newPassword }, ctx) => {
      if (confirmPassword !== newPassword) {
        ctx.addIssue({
          code: 'custom',
          message: t('auth.resetPassword.form.validation.passwordMatch'),
          path: ['confirmPassword'],
        });
      }
    }),
);

const { handleSubmit, handleReset, isFieldDirty, meta, values } = useForm({
  validationSchema: formSchema,
});

const isLoading = ref<boolean>(false);

const passwordScore = computed(() => {
  return useZxcvbn(values.newPassword);
});

const getStrengthColor = (level: number) => {
  if (level <= passwordScore.value) {
    switch (level) {
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  }
  return 'bg-gray-300';
};

const handleChangePassword = handleSubmit(async (values) => {
  changePasswordLogger.info('Change password form submitted', {
    action: 'form_submit',
    passwordStrength: passwordScore.value,
  });

  isLoading.value = true;

  const success = await authStore.changePassword({
    current_password: values.currentPassword,
    new_password: values.newPassword,
  });

  if (success) {
    changePasswordLogger.info('Password changed successfully', {
      action: 'change_password_success',
      passwordStrength: passwordScore.value,
    });

    toast.success(t('account.security.changePassword.success'));
    handleReset();
    emit('close');

    // Inform user about logout for security
    setTimeout(() => {
      toast.info(t('account.security.changePassword.logoutNotice'));
    }, 800);

    // Logout user after a delay to let them see the success message
    setTimeout(() => {
      changePasswordLogger.info('Auto-logout after password change', {
        action: 'auto_logout',
        reason: 'security_after_password_change',
      });
      authMachine.actor.send({ type: 'LOGOUT' });
    }, 2500);
  } else {
    changePasswordLogger.warn('Password change failed', {
      action: 'change_password_failed',
    });
    toast.error(t('account.security.changePassword.error'));
  }

  isLoading.value = false;
});
</script>

<template>
  <form class="flex flex-col gap-6">
    <div class="grid gap-6">
      <div class="grid gap-3">
        <FormField
          v-slot="{ componentField }"
          name="currentPassword"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate class="w-full">
            <div class="flex items-center">
              <FormLabel>
                {{ t('account.security.changePassword.currentPasswordLabel') }}
              </FormLabel>
            </div>
            <FormControl>
              <Input
                tabindex="1"
                type="password"
                v-bind="componentField"
                :placeholder="
                  t('account.security.changePassword.currentPasswordLabel')
                "
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <div class="grid gap-3">
        <FormField
          v-slot="{ componentField }"
          name="newPassword"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate class="w-full">
            <FormLabel>
              {{ t('account.security.changePassword.newPasswordLabel') }}
            </FormLabel>
            <FormControl>
              <Input tabindex="2" type="password" v-bind="componentField" />
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
              {{ t('account.security.changePassword.confirmPasswordLabel') }}
            </FormLabel>
            <FormControl>
              <Input
                tabindex="3"
                type="password"
                v-bind="componentField"
                @keydown.enter="handleChangePassword"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <span
        v-if="authStore.authError"
        class="text-destructive-foreground text-sm"
      >
        {{ authStore.authError }}
      </span>
    </div>
  </form>

  <DialogFooter>
    <Button
      tabindex="4"
      type="button"
      class="w-full"
      :disabled="!meta.valid || isLoading"
      @click="handleChangePassword"
    >
      <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
      <span v-else>{{ t('account.security.changePasswordButton') }}</span>
    </Button>
  </DialogFooter>
</template>
