<script setup lang="ts">
import { useAuthMachine } from '@/machines/auth.machine';
import { useAuthStore } from '@/stores/auth.stores';
import { Button } from '@components/atoms/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@components/atoms/form';
import {
  PinInput,
  PinInputGroup,
  PinInputSeparator,
  PinInputSlot,
} from '@components/atoms/pin-input';
import { TOTP_LENGTH } from '@core/constants/auth.constants';
import { Icon } from '@iconify/vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as z from 'zod';

const authMachine = useAuthMachine();
const { t } = useI18n();
const authStore = useAuthStore();
const isRecoveryMode = ref<boolean>(false);

const formSchema = toTypedSchema(
  z.object({
    totp: z
      .array(z.coerce.string({ error: t('auth.totp.form.validation.totp') }), {
        error: () => t('auth.totp.form.validation.totp'),
      })
      .length(TOTP_LENGTH, {
        error: () => t('auth.totp.form.validation.totpMinLength'),
      }),
  }),
);
const { handleSubmit, isFieldDirty, meta, setFieldValue } = useForm({
  validationSchema: formSchema,
});

const isLoading = computed(() => {
  return authMachine.state.matches('form.loading');
});

const handleTotp = handleSubmit(async (values) => {
  const code = values.totp.join('');

  if (isRecoveryMode.value) {
    await authStore.verifyRecoveryCode(code);
  } else {
    await authStore.verifyTotp(code);
  }
});

const toggleRecoveryMode = () => {
  isRecoveryMode.value = !isRecoveryMode.value;
  // Reset form when switching modes
  setFieldValue('totp', []);
};
</script>
<template>
  <form class="flex flex-col gap-6 items-center" @submit="handleTotp">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold">{{ t('auth.totp.form.title') }}</h1>
      <p class="text-muted-foreground w-full text-sm text-balance">
        {{
          isRecoveryMode ? t('auth.totp.form.subtitleRecovery')
          : authStore.totpType === 'totp' ? t('auth.totp.form.subtitleTotp')
          : t('auth.totp.form.subtitleEmail')
        }}
      </p>
    </div>
    <div class="grid gap-6">
      <div class="grid gap-3 justify-center">
        <FormField
          v-slot="{ componentField, value }"
          name="totp"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormControl>
              <!-- @vue-expect-error type="number" is required here to get the correct keyboard -->
              <PinInput
                id="totp"
                :model-value="value"
                class="flex gap-1 sm:gap-2 items-center mt-1"
                :otp="!isRecoveryMode"
                :type="isRecoveryMode ? 'text' : 'number'"
                :name="componentField.name"
                @update:model-value="
                  (arrNumber) => setFieldValue('totp', arrNumber)
                "
              >
                <PinInputGroup class="gap-1 sm:gap-2">
                  <template v-for="(id, index) in TOTP_LENGTH" :key="id">
                    <PinInputSlot
                      class="rounded-md border w-8 h-10 sm:w-10 sm:h-12 text-sm sm:text-base"
                      :index="index"
                    />
                    <template v-if="index === 3 && !isRecoveryMode">
                      <PinInputSeparator class="mx-1 sm:mx-2" />
                    </template>
                  </template>
                </PinInputGroup>
              </PinInput>
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
      <div class="flex flex-col gap-3">
        <Button
          tabindex="3"
          type="submit"
          class="w-full"
          :disabled="!meta.valid || isLoading"
        >
          <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
          <span v-else>{{
            isRecoveryMode ?
              t('auth.totp.form.recoveryButton')
            : t('auth.totp.form.totpButton')
          }}</span>
        </Button>

        <Button
          v-if="authStore.totpType === 'totp'"
          type="button"
          variant="ghost"
          size="sm"
          class="text-muted-foreground"
          @click="toggleRecoveryMode"
        >
          {{
            isRecoveryMode ?
              t('auth.totp.form.backToTotp')
            : t('auth.totp.form.useRecoveryCode')
          }}
        </Button>
      </div>
    </div>
  </form>
</template>
