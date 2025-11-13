<script setup lang="ts">
import { useAuthStore } from '@stores/auth.stores';
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
import { ref, onMounted, onUnmounted } from 'vue';
import { createComponentLogger } from '@utils/logger';
import { AnyActorRef, Subscription } from 'xstate';

const accountDeletionPasswordLogger = createComponentLogger(
  'AccountDeletionPasswordForm',
);

const props = defineProps<{
  actor: AnyActorRef;
}>();

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
let unsubscribe: Subscription | undefined;

const handleVerify = handleSubmit(async (values) => {
  accountDeletionPasswordLogger.info(
    'Account deletion password verification submitted',
    {
      action: 'form_submit',
      context: 'account_deletion',
    },
  );

  props.actor.send({ type: 'LOADING' });

  const verified = await authStore.verifyPassword(values.password, props.actor);

  props.actor.send({ type: 'IDLE' });

  if (!verified) {
    accountDeletionPasswordLogger.warn(
      'Account deletion password verification failed',
      {
        action: 'password_verification_failed',
        context: 'account_deletion',
      },
    );
    return;
  }

  accountDeletionPasswordLogger.info(
    'Account deletion password verification successful',
    {
      action: 'password_verification_success',
      context: 'account_deletion',
    },
  );

  props.actor.send({ type: 'PASSWORD_VERIFIED' });
  handleReset();
});

onMounted(() => {
  unsubscribe = props.actor.subscribe((snapshot) => {
    isLoading.value = snapshot.context.isLoading;
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe.unsubscribe();
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
      >
        {{ authStore.authError }}
      </span>
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
