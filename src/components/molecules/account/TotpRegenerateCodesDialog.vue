<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.stores';
import { Button } from '@components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/atoms/dialog';
import { Icon } from '@iconify/vue';
import { Alert, AlertDescription, AlertTitle } from '@components/atoms/alert';
import { ScrollArea } from '@components/atoms/scroll-area';
import { useI18n } from 'vue-i18n';
import { ref, computed, watch } from 'vue';
import { toast } from 'vue-sonner';

const authStore = useAuthStore();
const { t } = useI18n();

const isDialogOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const hasGenerated = ref<boolean>(false);
const hasCopied = ref<boolean>(false);

const recoveryCodesText = computed(() => {
  return authStore.totpRecoveryCodes.join('\n');
});

const handleRegenerate = async () => {
  isLoading.value = true;
  const success = await authStore.regenerateRecoveryCodes();

  if (success) {
    hasGenerated.value = true;
    toast.success(t('account.security.totpRegenerate.success'));
  } else {
    toast.error(t('account.security.totpRegenerate.error'));
  }

  isLoading.value = false;
};

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
        const content = `TOTP Recovery Codes (Regenerated)\n====================================\n\nThese NEW codes replace your previous recovery codes.\nStore them in a safe place - you will not be able to see them again.\n\n${recoveryCodesText.value}`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `totp-recovery-codes-regenerated-${new Date().toISOString().split('T')[0]}.txt`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve('Recovery codes downloaded successfully');
        }, 100);
      } catch (error) {
        reject(error);
      }
    });

  toast.promise(downloadPromise, {
    loading: t('account.security.totpRecovery.downloading'),
    success: t('account.security.totpRecovery.downloadSuccess'),
    error: () => {
      copyToClipboard();
      return t('account.security.totpRecovery.downloadError');
    },
  });
};

// Watch for dialog close to cleanup
watch(isDialogOpen, (newValue) => {
  if (!newValue) {
    hasGenerated.value = false;
    authStore.clearTotpRecoveryCodes();
  }
});
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button variant="outline" size="sm">
        <Icon icon="lucide:refresh-cw" class="h-4 w-4" />
        {{ t('account.security.totpRegenerate.button') }}
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {{ t('account.security.totpRegenerate.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('account.security.totpRegenerate.subtitle') }}
        </DialogDescription>
      </DialogHeader>

      <!-- Confirmation step -->
      <div v-if="!hasGenerated" class="flex flex-col gap-6">
        <Alert variant="destructive">
          <Icon icon="lucide:alert-triangle" />
          <AlertTitle>
            {{ t('account.security.totpRegenerate.warning.title') }}
          </AlertTitle>
          <AlertDescription>
            {{ t('account.security.totpRegenerate.warning.description') }}
          </AlertDescription>
        </Alert>

        <div class="flex gap-3">
          <Button
            variant="outline"
            class="flex-1"
            @click="() => (isDialogOpen = false)"
          >
            {{ t('account.common.cancel') }}
          </Button>
          <Button
            variant="destructive"
            class="flex-1"
            :disabled="isLoading"
            @click="handleRegenerate"
          >
            <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
            <span v-else>{{
              t('account.security.totpRegenerate.confirm')
            }}</span>
          </Button>
        </div>
      </div>

      <!-- New codes display -->
      <div v-else class="flex flex-col gap-6">
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
            {{ t('account.security.totpRegenerate.newCodes.title') }}
          </h3>
          <p class="text-muted-foreground text-sm">
            {{ t('account.security.totpRegenerate.newCodes.subtitle') }}
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
              {{ t('account.security.totpRegenerate.newCodes.warning') }}
            </AlertDescription>
          </Alert>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
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

            <Button
              variant="outline"
              class="flex-1"
              @click="downloadRecoveryCodes"
            >
              <Icon icon="lucide:download" class="h-4 w-4" />
              {{ t('account.security.totpRecovery.download') }}
            </Button>
          </div>

          <Button @click="() => (isDialogOpen = false)">
            {{ t('account.security.totpRegenerate.newCodes.complete') }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
