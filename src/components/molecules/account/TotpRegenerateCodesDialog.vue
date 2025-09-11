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
import { useTotpSecureActionMachine } from '@machines/totpSecureAction.machine';
import TotpSecurePasswordForm from './TotpSecurePasswordForm.vue';
import { useI18n } from 'vue-i18n';
import { ref, computed, watch } from 'vue';
import { toast } from 'vue-sonner';

const authStore = useAuthStore();
const { t } = useI18n();
const { actor } = useTotpSecureActionMachine();

const isDialogOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const hasCopied = ref<boolean>(false);
const isPasswordVerifyStep = ref<boolean>(false);
const isConfirmStep = ref<boolean>(false);
const isActionStep = ref<boolean>(false);
const isResultStep = ref<boolean>(false);
const isErrorStep = ref<boolean>(false);
const errorMessage = ref<string>('');

const recoveryCodesText = computed(() => {
  return authStore.totpRecoveryCodes.join('\n');
});

// Subscribe to state machine changes
actor.subscribe((snapshot) => {
  isLoading.value = snapshot.context.isLoading;
  isPasswordVerifyStep.value = snapshot.matches('flow.password_verify');
  isConfirmStep.value = snapshot.matches('flow.confirm');
  isActionStep.value = snapshot.matches('flow.action');
  isResultStep.value = snapshot.matches('flow.result');
  isErrorStep.value = snapshot.matches('flow.error');
  errorMessage.value = snapshot.context.error || '';

  // Handle state transitions
  if (snapshot.matches('flow.result')) {
    toast.success(t('account.security.totpRegenerate.success'));
  } else if (snapshot.matches('flow.completed')) {
    isDialogOpen.value = false;
  } else if (snapshot.matches('flow.error')) {
    toast.error(
      snapshot.context.error
        || t('account.security.totpRegenerate.error.description'),
    );
  }
});

const handleRegenerateAction = async () => {
  try {
    // Move to action state first
    actor.send({ type: 'CONFIRM_ACTION' });

    // Set loading state
    actor.send({ type: 'LOADING' });

    const success = await authStore.regenerateRecoveryCodes();

    // Clear loading state
    actor.send({ type: 'IDLE' });

    if (success) {
      actor.send({ type: 'ACTION_SUCCESS' });
    } else {
      actor.send({
        type: 'ACTION_ERROR',
        error: t('account.security.totpRegenerate.error.description'),
      });
    }
  } catch (err) {
    actor.send({ type: 'IDLE' });
    actor.send({
      type: 'ACTION_ERROR',
      error:
        err instanceof Error ? err.message : 'An unexpected error occurred',
    });
  }
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

const openDialog = () => {
  isDialogOpen.value = true;
  // Reset state machine first to prevent conflicts with previous actions
  actor.send({ type: 'RESET' });
  actor.send({ type: 'START_ACTION', actionType: 'regenerate' });
};

const closeDialog = () => {
  isDialogOpen.value = false;
  actor.send({ type: 'RESET' });
};

// Watch for dialog close to cleanup
watch(isDialogOpen, (newValue) => {
  if (!newValue) {
    authStore.clearTotpRecoveryCodes();
    actor.send({ type: 'RESET' });
  }
});
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button variant="outline" size="sm" @click="openDialog">
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

      <!-- Password verification step -->
      <div v-if="isPasswordVerifyStep">
        <div class="flex flex-col gap-6">
          <Alert variant="destructive">
            <Icon icon="lucide:shield-alert" />
            <AlertTitle>
              {{ t('account.security.totpRegenerate.passwordVerify.title') }}
            </AlertTitle>
            <AlertDescription>
              {{
                t('account.security.totpRegenerate.passwordVerify.description')
              }}
            </AlertDescription>
          </Alert>

          <TotpSecurePasswordForm />
        </div>
      </div>

      <!-- Confirmation step -->
      <div v-else-if="isConfirmStep">
        <div class="flex flex-col gap-6">
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
            <Button variant="outline" class="flex-1" @click="closeDialog">
              {{ t('account.common.cancel') }}
            </Button>
            <Button
              variant="destructive"
              class="flex-1"
              :disabled="isLoading"
              @click="handleRegenerateAction"
            >
              <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
              <span v-else>{{
                t('account.security.totpRegenerate.confirm')
              }}</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Action in progress -->
      <div v-else-if="isActionStep">
        <div class="flex flex-col gap-6 items-center">
          <Icon icon="svg-spinners:ring-resize" class="h-8 w-8" />
          <p class="text-muted-foreground">
            {{ t('account.security.totpRegenerate.processing') }}
          </p>
        </div>
      </div>

      <!-- New codes display -->
      <div v-else-if="isResultStep">
        <div class="flex flex-col gap-6">
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

            <Button @click="() => actor.send({ type: 'COMPLETE' })">
              {{ t('account.security.totpRegenerate.newCodes.complete') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="isErrorStep" class="flex flex-col gap-6">
        <Alert variant="destructive">
          <Icon icon="lucide:alert-circle" />
          <AlertTitle>
            {{ t('account.security.totpRegenerate.error.title') }}
          </AlertTitle>
          <AlertDescription>
            {{
              errorMessage
              || t('account.security.totpRegenerate.error.description')
            }}
          </AlertDescription>
        </Alert>

        <div class="flex gap-3">
          <Button variant="outline" class="flex-1" @click="closeDialog">
            {{ t('account.common.cancel') }}
          </Button>
          <Button
            variant="default"
            class="flex-1"
            @click="() => actor.send({ type: 'RESET' })"
          >
            {{ t('account.common.retry') }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
