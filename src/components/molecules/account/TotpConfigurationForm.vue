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
import { onMounted } from 'vue';

const { actor } = useTotpConfigurationMachine();
const authStore = useAuthStore();
const { t } = useI18n();
const formSchema = toTypedSchema(
  z.object({
    totp: z
      .string({ error: () => t('account.security.totpForm.validation.totp') })
      .length(8, {
        error: () => t('account.security.totpForm.validation.totpLength'),
      }),
  }),
);
const { isFieldDirty, meta } = useForm({
  validationSchema: formSchema,
});
const isLoading = ref<boolean>(false);
const qrCode = ref<string | null>(null);

actor.subscribe((snapshot) => {
  isLoading.value = snapshot.matches('form.loading');
});

onMounted(() => {
  authStore.askForTotp().then((res) => {
    qrCode.value = res?.qr_code ?? null;
  });
});
</script>
<template>
  <div>
    <img
      v-if="qrCode"
      :src="`data:image/png;base64,${qrCode}`"
      alt="totp qrcode"
      class="w-sm h-sm"
    />
    <form class="flex flex-col gap-6">
      <div class="grid gap-6">
        <div class="grid gap-3">
          <FormField
            v-slot="{ componentField }"
            name="totp"
            :validate-on-blur="!isFieldDirty"
          >
            <FormItem v-auto-animate class="w-full">
              <div class="flex items-center">
                <FormLabel>
                  {{ t('account.security.totpForm.label') }}
                </FormLabel>
              </div>
              <FormControl>
                <Input
                  tabindex="2"
                  type="password"
                  v-bind="componentField"
                  placeholder="12345678"
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
  </div>
  <DialogFooter>
    <Button
      tabindex="3"
      type="submit"
      class="w-full"
      :disabled="!meta.valid || isLoading"
      @click="() => {}"
    >
      <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
      <span v-else>{{ t('account.security.totpForm.button') }}</span>
    </Button>
  </DialogFooter>
</template>
