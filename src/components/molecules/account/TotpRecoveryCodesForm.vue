<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.stores';
import { Button } from '@components/atoms/button';
import { DialogFooter } from '@components/atoms/dialog';
import { Icon } from '@iconify/vue';
import { Alert, AlertDescription, AlertTitle } from '@components/atoms/alert';
import { ScrollArea } from '@components/atoms/scroll-area';
import { useTotpConfigurationMachine } from '@machines/totpConfiguration.machine';
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';
import { toast } from 'vue-sonner';

const { actor } = useTotpConfigurationMachine();
const authStore = useAuthStore();
const { t } = useI18n();

const isLoading = ref<boolean>(false);
const hasCopied = ref<boolean>(false);

actor.subscribe((snapshot) => {
  isLoading.value = snapshot.matches('form.loading');
});

const recoveryCodesText = computed(() => {
  return authStore.totpRecoveryCodes.join('\n');
});

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(recoveryCodesText.value);
    hasCopied.value = true;
    setTimeout(() => {
      hasCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
};

const downloadRecoveryCodes = () => {
  const downloadPromise = () =>
    new Promise((resolve, reject) => {
      try {
        const content = `TOTP Recovery Codes\n==================\n\nThese codes can be used to access your account if you lose your authenticator device.\nStore them in a safe place - you will not be able to see them again.\n\n${recoveryCodesText.value}`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `totp-recovery-codes-${new Date().toISOString().split('T')[0]}.txt`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve('Recovery codes downloaded successfully');
        }, 100);
      } catch (error) {
        console.error('Failed to download recovery codes:', error);
        reject(error);
      }
    });

  toast.promise(downloadPromise, {
    loading: t('account.security.totpRecovery.downloading'),
    success: t('account.security.totpRecovery.downloadSuccess'),
    error: () => {
      // Fallback: copy to clipboard
      copyToClipboard();
      return t('account.security.totpRecovery.downloadError');
    },
  });
};

const handleComplete = async () => {
  // Fermer le dialogue immédiatement via le store
  authStore.closeTotpDialog();

  // Nettoyage et rafraîchissement en arrière-plan
  setTimeout(async () => {
    authStore.clearTotpRecoveryCodes();
    actor.send({ type: 'RESET' });
    // Rafraîchir les données utilisateur pour voir le TOTP activé
    await authStore.me();
  }, 100);
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="flex justify-center mb-4">
        <div
          class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
        >
          <Icon
            icon="lucide:shield-check"
            class="h-6 w-6 text-green-600 dark:text-green-400"
          />
        </div>
      </div>
      <h3 class="text-lg font-semibold">
        {{ t('account.security.totpRecovery.title') }}
      </h3>
      <p class="text-muted-foreground text-sm">
        {{ t('account.security.totpRecovery.subtitle') }}
      </p>
    </div>

    <!-- Recovery Codes -->
    <div class="space-y-4">
      <div class="bg-muted/50 rounded-lg p-4 border border-border">
        <ScrollArea class="h-48">
          <div
            class="bg-background border rounded p-3 font-mono text-xs leading-relaxed"
          >
            <div
              v-for="(code, index) in authStore.totpRecoveryCodes"
              :key="index"
              class="py-1 border-b border-border last:border-b-0"
            >
              {{ code }}
            </div>
          </div>
        </ScrollArea>
      </div>

      <!-- Warning -->
      <Alert variant="destructive">
        <Icon icon="lucide:alert-triangle" />
        <AlertTitle>
          {{ t('account.security.totpRecovery.warning.title') }}
        </AlertTitle>
        <AlertDescription>
          {{ t('account.security.totpRecovery.warning.description') }}
        </AlertDescription>
      </Alert>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Button variant="outline" class="flex-1" @click="copyToClipboard">
        <Icon
          :icon="hasCopied ? 'lucide:check' : 'lucide:copy'"
          class="h-4 w-4"
        />
        {{
          hasCopied ?
            t('account.security.totpRecovery.copied')
          : t('account.security.totpRecovery.copy')
        }}
      </Button>

      <Button variant="outline" class="flex-1" @click="downloadRecoveryCodes">
        <Icon icon="lucide:download" class="h-4 w-4" />
        {{ t('account.security.totpRecovery.download') }}
      </Button>
    </div>
  </div>

  <DialogFooter>
    <Button
      type="button"
      class="w-full"
      :disabled="isLoading"
      @click="handleComplete"
    >
      <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
      <span v-else>{{ t('account.security.totpRecovery.complete') }}</span>
    </Button>
  </DialogFooter>
</template>
