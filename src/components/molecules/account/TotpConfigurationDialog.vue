<script setup lang="ts">
import { Button } from '@components/atoms/button';
import { Icon } from '@iconify/vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/atoms/dialog';
import { useI18n } from 'vue-i18n';
import { useTotpConfigurationMachine } from '@machines/totpConfiguration.machine';
import { ref, computed } from 'vue';

const { actor } = useTotpConfigurationMachine();
const { t } = useI18n();
const isPasswordVerification = ref<boolean>(true);
const title = computed(() =>
  isPasswordVerification.value ?
    t('account.security.passwordVerifyForm.title')
  : t('account.security.totpForm.title'),
);
const subtitle = computed(() =>
  isPasswordVerification.value ?
    t('account.security.passwordVerifyForm.subtitle')
  : t('account.security.totpForm.subtitle'),
);

actor.subscribe((snapshot) => {
  isPasswordVerification.value = snapshot.matches('flow.password_verify');
});
</script>
<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline">
        <Icon icon="lucide:lock" />
        {{ t('account.security.totpConfigureButton') }}
      </Button>
    </DialogTrigger>
    <DialogContent
      class="sm:max-w-[425px]"
      @interact-outside="(e) => e.preventDefault()"
    >
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ subtitle }}
        </DialogDescription>
      </DialogHeader>
      <slot v-if="isPasswordVerification" name="password" />
      <slot v-if="!isPasswordVerification" name="totp" />
    </DialogContent>
  </Dialog>
</template>
