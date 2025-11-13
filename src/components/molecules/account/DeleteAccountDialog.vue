<script setup lang="ts">
import { useAuthStore } from '@stores/auth.stores';
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
import { useAccountDeletionMachine } from '@machines/accountDeletion.machine';
import AccountDeletionPasswordForm from './AccountDeletionPasswordForm.vue';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import { createComponentLogger } from '@utils/logger';

const deleteAccountLogger = createComponentLogger('DeleteAccountDialog');

const authStore = useAuthStore();
const { t } = useI18n();
const { actor } = useAccountDeletionMachine();

const isDialogOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const isPasswordVerifyStep = ref<boolean>(false);
const isConfirmStep = ref<boolean>(false);
const isActionStep = ref<boolean>(false);
const isErrorStep = ref<boolean>(false);
const errorMessage = ref<string>('');

// Subscribe to state machine changes
actor.subscribe((snapshot) => {
  isLoading.value = snapshot.context.isLoading;
  isPasswordVerifyStep.value = snapshot.matches('flow.password_verify');
  isConfirmStep.value = snapshot.matches('flow.confirm');
  isActionStep.value = snapshot.matches('flow.action');
  isErrorStep.value = snapshot.matches('flow.error');
  errorMessage.value = snapshot.context.error || '';

  // Handle state transitions
  if (snapshot.matches('flow.completed')) {
    deleteAccountLogger.info('Account deletion completed', {
      action: 'account_deleted',
    });
    isDialogOpen.value = false;
    toast.success(t('account.dangerZone.deleteAccount.success'));
  } else if (snapshot.matches('flow.error')) {
    deleteAccountLogger.error('Account deletion failed', undefined, {
      action: 'account_deletion_error',
      error: snapshot.context.error,
    });
    toast.error(
      snapshot.context.error
        || t('account.dangerZone.deleteAccount.error.description'),
    );
  }
});

const handleDeleteAction = async () => {
  deleteAccountLogger.info('User confirmed account deletion', {
    action: 'confirm_deletion',
  });

  try {
    // Move to action state first
    actor.send({ type: 'CONFIRM_DELETION' });

    // Set loading state
    actor.send({ type: 'LOADING' });

    const success = await authStore.deleteAccount();

    // Clear loading state
    actor.send({ type: 'IDLE' });

    if (success) {
      deleteAccountLogger.info('Account deletion successful', {
        action: 'deletion_success',
      });
      actor.send({ type: 'DELETION_SUCCESS' });
    } else {
      deleteAccountLogger.warn('Account deletion failed', {
        action: 'deletion_failed',
      });
      actor.send({
        type: 'DELETION_ERROR',
        error: t('account.dangerZone.deleteAccount.error.description'),
      });
    }
  } catch (err) {
    deleteAccountLogger.error('Account deletion error', err as Error, {
      action: 'deletion_error',
    });
    actor.send({ type: 'IDLE' });
    actor.send({
      type: 'DELETION_ERROR',
      error:
        err instanceof Error ? err.message : 'An unexpected error occurred',
    });
  }
};

const openDialog = () => {
  deleteAccountLogger.info('Opening account deletion dialog', {
    action: 'open_dialog',
  });
  isDialogOpen.value = true;
  // Reset state machine first to prevent conflicts with previous actions
  actor.send({ type: 'RESET' });
  actor.send({ type: 'START_DELETION' });
};

const closeDialog = () => {
  deleteAccountLogger.info('Closing account deletion dialog', {
    action: 'close_dialog',
  });
  isDialogOpen.value = false;
  actor.send({ type: 'RESET' });
};

// Watch for dialog close to cleanup
watch(isDialogOpen, (newValue) => {
  if (!newValue) {
    actor.send({ type: 'RESET' });
  }
});
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button variant="destructive" size="sm" @click="openDialog">
        <Icon icon="lucide:trash-2" class="h-4 w-4" />
        {{ t('account.dangerZone.deleteAccount.button') }}
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {{ t('account.dangerZone.deleteAccount.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('account.dangerZone.deleteAccount.subtitle') }}
        </DialogDescription>
      </DialogHeader>

      <!-- Password verification step -->
      <div v-if="isPasswordVerifyStep">
        <div class="flex flex-col gap-6">
          <Alert variant="destructive">
            <Icon icon="lucide:shield-alert" />
            <AlertTitle>
              {{ t('account.dangerZone.deleteAccount.passwordVerify.title') }}
            </AlertTitle>
            <AlertDescription>
              {{
                t('account.dangerZone.deleteAccount.passwordVerify.description')
              }}
            </AlertDescription>
          </Alert>

          <AccountDeletionPasswordForm :actor="actor" />
        </div>
      </div>

      <!-- Confirmation step -->
      <div v-else-if="isConfirmStep">
        <div class="flex flex-col gap-6">
          <Alert variant="destructive">
            <Icon icon="lucide:alert-triangle" />
            <AlertTitle>
              {{ t('account.dangerZone.deleteAccount.warning.title') }}
            </AlertTitle>
            <AlertDescription>
              {{ t('account.dangerZone.deleteAccount.warning.description') }}
            </AlertDescription>
          </Alert>

          <div class="space-y-3">
            <h4 class="font-medium text-sm">
              {{ t('account.dangerZone.deleteAccount.consequences.title') }}
            </h4>
            <ul class="text-sm text-muted-foreground space-y-1">
              <li class="flex items-start gap-2">
                <Icon icon="lucide:x" class="h-4 w-4 mt-0.5 text-destructive" />
                {{ t('account.dangerZone.deleteAccount.consequences.item1') }}
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="lucide:x" class="h-4 w-4 mt-0.5 text-destructive" />
                {{ t('account.dangerZone.deleteAccount.consequences.item2') }}
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="lucide:x" class="h-4 w-4 mt-0.5 text-destructive" />
                {{ t('account.dangerZone.deleteAccount.consequences.item3') }}
              </li>
            </ul>
          </div>

          <Alert>
            <Icon icon="lucide:info" />
            <AlertTitle>
              {{ t('account.dangerZone.deleteAccount.delay.title') }}
            </AlertTitle>
            <AlertDescription>
              {{ t('account.dangerZone.deleteAccount.delay.description') }}
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
              @click="handleDeleteAction"
            >
              <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
              <span v-else>{{
                t('account.dangerZone.deleteAccount.confirm')
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
            {{ t('account.dangerZone.deleteAccount.processing') }}
          </p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="isErrorStep" class="flex flex-col gap-6">
        <Alert variant="destructive">
          <Icon icon="lucide:alert-circle" />
          <AlertTitle>
            {{ t('account.dangerZone.deleteAccount.error.title') }}
          </AlertTitle>
          <AlertDescription>
            {{
              errorMessage
              || t('account.dangerZone.deleteAccount.error.description')
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
