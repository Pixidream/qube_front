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
import { useTotpConfigurationMachine } from '@machines/totpConfiguration.machine';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import z from 'zod';
import { ref } from 'vue';
import { createComponentLogger } from '@/utils/logger';

// Create component-specific logger
const verifyPasswordLogger = createComponentLogger('VerifyPasswordForm');

const { actor } = useTotpConfigurationMachine();
const authStore = useAuthStore();
const { t } = useI18n();
const formSchema = toTypedSchema(
  z.object({
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
const isLoading = ref<boolean>(false);

actor.subscribe((snapshot) => {
  isLoading.value = snapshot.matches('form.loading');
});

const handleVerify = handleSubmit(async (values) => {
  verifyPasswordLogger.info('Password verification form submitted', {
    action: 'form_submit',
    context: 'totp_configuration',
  });

  const verified = await authStore.verifyPassword(values.password);

  if (!verified) {
    verifyPasswordLogger.warn('Password verification failed', {
      action: 'password_verification_failed',
      context: 'totp_configuration',
    });
    return;
  }

  verifyPasswordLogger.info('Password verification successful', {
    action: 'password_verification_success',
    context: 'totp_configuration',
  });

  actor.send({ type: 'TOTP_CONFIG' });
  handleReset();
});
</script>
<template>
  <form class="flex flex-col gap-6">
    <div class="grid gap-6">
      <div class="grid gap-3">
        <FormField
          v-slot="{ componentField }"
          name="password"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate class="w-full">
            <div class="flex items-center">
              <FormLabel>
                {{ t('account.security.passwordVerifyForm.label') }}
              </FormLabel>
            </div>
            <FormControl>
              <Input
                tabindex="2"
                type="password"
                v-bind="componentField"
                :placeholder="t('account.security.passwordVerifyForm.label')"
                @keydown.enter="handleVerify"
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
    </div>
  </form>
  <DialogFooter>
    <Button
      tabindex="3"
      type="button"
      class="w-full"
      :disabled="!meta.valid || isLoading"
      @click="handleVerify"
    >
      <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
      <span v-else>{{ t('account.security.passwordVerifyForm.button') }}</span>
    </Button>
  </DialogFooter>
</template>
