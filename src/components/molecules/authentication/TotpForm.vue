<script setup lang="ts">
import { ref } from 'vue';
import * as z from 'zod';
import { useI18n } from 'vue-i18n';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { TOTP_LENGTH } from '@core/constants/auth.constants';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@components/atoms/form';
import { Button } from '@components/atoms/button';
import {
  PinInput,
  PinInputGroup,
  PinInputSlot,
  PinInputSeparator,
} from '@components/atoms/pin-input';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth.stores';

const { t } = useI18n();
const authStore = useAuthStore();
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
const globalError = ref<string | null>(null);
const isLoading = ref(false);

const handleTotp = handleSubmit(async (values) => {
  const totp = values.totp.join('');

  await authStore.verifyTotp(totp);

  console.log(totp);
});
</script>
<template>
  <form class="flex flex-col gap-6 items-center" @submit="handleTotp">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold">{{ t('auth.totp.form.title') }}</h1>
      <p class="text-muted-foreground w-full text-sm text-balance">
        {{ t('auth.totp.form.subtitle') }}
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
              <PinInput
                id="totp"
                :model-value="value"
                class="flex gap-2 items-center mt-1"
                otp
                type="number"
                :name="componentField.name"
                @update:model-value="
                  (arrNumber) => setFieldValue('totp', arrNumber)
                "
              >
                <PinInputGroup>
                  <template v-for="(id, index) in TOTP_LENGTH" :key="id">
                    <PinInputSlot
                      class="rounded-md border mx-1"
                      :index="index"
                    />
                    <template v-if="index === 3">
                      <PinInputSeparator class="mx-2" />
                    </template>
                  </template>
                </PinInputGroup>
              </PinInput>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <span v-if="globalError" class="text-destructive-foreground text-sm">{{
        globalError
      }}</span>
      <Button
        tabindex="3"
        type="submit"
        class="w-full"
        :disabled="!meta.valid || isLoading"
      >
        <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
        <span v-else>{{ t('auth.totp.form.totpButton') }}</span>
      </Button>
    </div>
  </form>
</template>
