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
import { useAuthStore } from '@/stores/auth.stores';
import { ref, computed, watch } from 'vue';

const { actor } = useTotpConfigurationMachine();
const authStore = useAuthStore();
const { t } = useI18n();
const isPasswordVerification = ref<boolean>(true);
const isTotpConfig = ref<boolean>(false);
const isRecoveryCodes = ref<boolean>(false);

const title = computed(() => {
  if (isPasswordVerification.value) {
    return t('account.security.passwordVerifyForm.title');
  } else if (isTotpConfig.value) {
    return t('account.security.totpForm.title');
  } else if (isRecoveryCodes.value) {
    return t('account.security.totpRecovery.title');
  }
  return '';
});

const subtitle = computed(() => {
  if (isPasswordVerification.value) {
    return t('account.security.passwordVerifyForm.subtitle');
  } else if (isTotpConfig.value) {
    return t('account.security.totpForm.subtitle');
  } else if (isRecoveryCodes.value) {
    return t('account.security.totpRecovery.subtitle');
  }
  return '';
});

const isDialogOpen = ref<boolean>(false);

actor.subscribe((snapshot) => {
  isPasswordVerification.value = snapshot.matches('flow.password_verify');
  isTotpConfig.value = snapshot.matches('flow.totp_config');
  isRecoveryCodes.value = snapshot.matches('flow.recovery_codes');
});

const handleDialogClose = (open: boolean) => {
  if (!open) {
    // Dialogue fermé
    actor.send({ type: 'RESET' });
    authStore.clearTotpRecoveryCodes();
  }
  isDialogOpen.value = open;
};

// Surveiller l'état de fermeture depuis le store
watch(
  () => authStore.shouldCloseTotpDialog,
  (shouldClose) => {
    if (shouldClose) {
      isDialogOpen.value = false;
      authStore.resetTotpDialogState();
    }
  },
);
</script>
<template>
  <Dialog v-model:open="isDialogOpen" @update:open="handleDialogClose">
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
      <slot v-if="isTotpConfig" name="totp" />
      <slot v-if="isRecoveryCodes" name="recovery" />
    </DialogContent>
  </Dialog>
</template>
