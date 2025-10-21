<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.stores';
import { Button } from '@components/atoms/button';
import { DialogFooter } from '@components/atoms/dialog';
import { Icon } from '@iconify/vue';
import {
  PinInput,
  PinInputGroup,
  PinInputSeparator,
  PinInputSlot,
} from '@components/atoms/pin-input';
import { Skeleton } from '@components/atoms/skeleton';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/atoms/form';
import { useTotpConfigurationMachine } from '@machines/totpConfiguration.machine';
import { TOTP_LENGTH } from '@core/constants/auth.constants';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import z from 'zod';
import { ref } from 'vue';
import { onMounted, watch } from 'vue';
import { createComponentLogger } from '@/utils/logger';

// Create component-specific logger
const totpConfigFormLogger = createComponentLogger('TotpConfigurationForm');

const { actor } = useTotpConfigurationMachine();
const authStore = useAuthStore();
const { t } = useI18n();
const formSchema = toTypedSchema(
  z.object({
    totp: z
      .array(
        z.coerce.string({
          error: () => t('account.security.totpForm.validation.totp'),
        }),
        {
          error: () => t('account.security.totpForm.validation.totp'),
        },
      )
      .length(TOTP_LENGTH, {
        error: () => t('account.security.totpForm.validation.totpLength'),
      }),
  }),
);
const { handleSubmit, handleReset, isFieldDirty, meta, setFieldValue, values } =
  useForm({
    validationSchema: formSchema,
  });
const isLoading = ref<boolean>(false);
const qrCode = ref<string | null>(null);
const isLoadingQrCode = ref<boolean>(false);

actor.subscribe((snapshot) => {
  isLoading.value = snapshot.matches('form.loading');
});

const loadQrCode = async () => {
  totpConfigFormLogger.info('Loading TOTP QR code', {
    action: 'load_qr_code',
    context: 'totp_setup',
  });

  isLoadingQrCode.value = true;
  qrCode.value = null;

  try {
    const res = await authStore.askForTotp();
    qrCode.value = res?.qr_code ?? null;

    if (qrCode.value) {
      totpConfigFormLogger.info('TOTP QR code loaded successfully', {
        action: 'qr_code_loaded',
        context: 'totp_setup',
      });
    } else {
      totpConfigFormLogger.warn('No QR code received from server', {
        action: 'qr_code_missing',
        context: 'totp_setup',
      });
    }
  } catch (error) {
    totpConfigFormLogger.error('Failed to load TOTP QR code', error as Error, {
      action: 'qr_code_load_failed',
      context: 'totp_setup',
    });
  } finally {
    isLoadingQrCode.value = false;
  }
};

const handleSetup = handleSubmit(async (values) => {
  const totp = values.totp.join('');

  totpConfigFormLogger.info('TOTP configuration form submitted', {
    action: 'form_submit',
    context: 'totp_setup',
    codeLength: totp.length,
  });

  const success = await authStore.setupTotp(totp);

  if (!success) {
    totpConfigFormLogger.warn('TOTP setup failed', {
      action: 'totp_setup_failed',
      context: 'totp_setup',
    });
    return;
  }

  totpConfigFormLogger.info(
    'TOTP setup successful, proceeding to recovery codes',
    {
      action: 'totp_setup_success',
      context: 'totp_setup',
    },
  );

  actor.send({ type: 'SHOW_RECOVERY_CODES' });
  handleReset();
});

// Auto-submit when TOTP is complete
watch(
  () => values.totp,
  (newValue) => {
    if (newValue && newValue.length === TOTP_LENGTH && meta.value.valid) {
      totpConfigFormLogger.debug('TOTP code complete, auto-submitting', {
        action: 'auto_submit',
        context: 'totp_setup',
        codeLength: newValue.length,
      });
      handleSetup();
    }
  },
);

onMounted(() => {
  totpConfigFormLogger.debug('TOTP configuration form mounted', {
    action: 'component_mounted',
    context: 'totp_setup',
  });
  loadQrCode();
});
</script>
<template>
  <div>
    <div class="w-sm container-sm mb-4">
      <Skeleton v-if="isLoadingQrCode" class="w-full h-full" />
      <img
        v-else-if="qrCode"
        :src="`data:image/png;base64,${qrCode}`"
        alt="totp qrcode"
        class="w-full h-full rounded-sm"
      />
      <div
        v-else
        class="w-full h-full bg-card border border-border rounded-md flex items-center justify-center"
      >
        <Button
          variant="ghost"
          size="icon"
          :disabled="isLoadingQrCode"
          @click="loadQrCode"
        >
          <Icon icon="lucide:refresh-cw" class="h-6 w-6" />
        </Button>
      </div>
    </div>

    <form class="flex flex-col gap-6">
      <div class="grid gap-6">
        <div class="grid gap-3">
          <FormField
            v-slot="{ componentField, value }"
            name="totp"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem v-auto-animate class="w-full">
              <div class="flex items-center justify-center">
                <FormLabel>
                  {{ t('account.security.totpForm.label') }}
                </FormLabel>
              </div>
              <FormControl>
                <!-- @vue-expect-error type="number" is required here to get the correct keyboard -->
                <PinInput
                  id="totp"
                  :model-value="value"
                  class="flex items-center justify-center mt-1"
                  otp
                  type="number"
                  :name="componentField.name"
                  @update:model-value="
                    (arrNumber) => setFieldValue('totp', arrNumber)
                  "
                  @keydown.enter="handleSetup"
                >
                  <PinInputGroup class="gap-1">
                    <template v-for="(id, index) in TOTP_LENGTH" :key="id">
                      <PinInputSlot
                        class="rounded-md border w-7 h-8 text-sm"
                        :index="index"
                      />
                      <template v-if="index === 3">
                        <PinInputSeparator class="mx-1" />
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
        >
          {{ authStore.authError }}
        </span>
      </div>
    </form>
  </div>
  <DialogFooter>
    <Button
      tabindex="3"
      type="button"
      class="w-full"
      :disabled="!meta.valid || isLoading"
      @click="handleSetup"
    >
      <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
      <span v-else>{{ t('account.security.totpForm.button') }}</span>
    </Button>
  </DialogFooter>
</template>

<style scoped>
.container-sm {
  height: var(--container-sm);
}
</style>
