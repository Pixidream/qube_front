<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth.stores';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/atoms/form';
import { Button } from '@components/atoms/button';
import { Input } from '@components/atoms/input';
import { Icon } from '@iconify/vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import * as z from 'zod';
import { createComponentLogger } from '@/utils/logger';
import { UpdateUserBody } from '@/core/types/auth';
import { useUpdateEmailMachine } from '@machines/emailUpdate.machine';
import { useAuthMachine } from '@/machines/auth.machine';

const emailUpdateFormLogger = createComponentLogger('EmailUpdateForm');

const authStore = useAuthStore();
const updateEmailMachine = useUpdateEmailMachine();
const authMachine = useAuthMachine();
const { t } = useI18n();

emailUpdateFormLogger.debug('Initializing profile form component');
const formSchema = toTypedSchema(
  z.object({
    email: z
      .email({ error: () => t('auth.login.form.validation.email') })
      .min(2, { error: () => t('auth.login.form.validation.emailMinLength') })
      .max(250, {
        error: () => t('auth.login.form.validation.emailMaxLength'),
      }),
  }),
);
const { handleSubmit, handleReset, isFieldDirty, meta } = useForm({
  validationSchema: formSchema,
});

const saveDisabled = computed(
  () =>
    (meta.value.valid && !meta.value.dirty)
    || updateEmailMachine.state.matches('form.loading'),
);

const isLoading = computed(() =>
  updateEmailMachine.state.matches('form.loading'),
);

const handleProfileUpdate = handleSubmit(async (values) => {
  updateEmailMachine.actor.send({ type: 'LOADING' });
  try {
    await authStore.updateProfile({ email: values.email } as UpdateUserBody);
    handleReset();
    authMachine.actor.send({ type: 'LOGOUT' });
  } finally {
    updateEmailMachine.actor.send({ type: 'IDLE' });
  }
});

onUnmounted(() => {
  handleReset();
});
</script>
<template>
  <form class="flex flex-col gap-6" @submit="handleProfileUpdate">
    <div class="grid gap-6">
      <!-- Email -->
      <div class="space-y-2">
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
    </div>
    <span v-if="authStore.authError" class="text-destructive-foreground">{{
      authStore.authError
    }}</span>
    <Button :disabled="saveDisabled" type="submit">
      <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
      <span v-else>{{ t('account.common.saveChanges') }}</span>
    </Button>
  </form>
</template>
