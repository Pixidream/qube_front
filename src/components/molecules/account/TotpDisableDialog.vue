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
import { useTotpSecureActionMachine } from '@machines/totpSecureAction.machine';
import TotpSecurePasswordForm from './TotpSecurePasswordForm.vue';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';

const authStore = useAuthStore();
const { t } = useI18n();
const { actor } = useTotpSecureActionMachine();

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
    isDialogOpen.value = false;
    toast.success(t('account.security.totpDisable.success'));
  } else if (snapshot.matches('flow.error')) {
    toast.error(
      snapshot.context.error
        || t('account.security.totpDisable.error.description'),
    );
  }
});

const handleDisableAction = async () => {
  try {
    // Move to action state first
    actor.send({ type: 'CONFIRM_ACTION' });

    // Set loading state
    actor.send({ type: 'LOADING' });

    const success = await authStore.disableTotp();

    // Clear loading state
    actor.send({ type: 'IDLE' });

    if (success) {
      actor.send({ type: 'ACTION_SUCCESS' });
    } else {
      actor.send({
        type: 'ACTION_ERROR',
        error: t('account.security.totpDisable.error.description'),
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

const openDialog = () => {
  isDialogOpen.value = true;
  // Reset state machine first to prevent conflicts with previous actions
  actor.send({ type: 'RESET' });
  actor.send({ type: 'START_ACTION', actionType: 'disable' });
};

const closeDialog = () => {
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
        <Icon icon="lucide:shield-off" class="h-4 w-4" />
        {{ t('account.security.totpDisable.button') }}
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {{ t('account.security.totpDisable.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('account.security.totpDisable.subtitle') }}
        </DialogDescription>
      </DialogHeader>

      <!-- Password verification step -->
      <div v-if="isPasswordVerifyStep">
        <div class="flex flex-col gap-6">
          <Alert variant="destructive">
            <Icon icon="lucide:shield-alert" />
            <AlertTitle>
              {{ t('account.security.totpDisable.passwordVerify.title') }}
            </AlertTitle>
            <AlertDescription>
              {{ t('account.security.totpDisable.passwordVerify.description') }}
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
              {{ t('account.security.totpDisable.warning.title') }}
            </AlertTitle>
            <AlertDescription>
              {{ t('account.security.totpDisable.warning.description') }}
            </AlertDescription>
          </Alert>

          <div class="space-y-3">
            <h4 class="font-medium text-sm">
              {{ t('account.security.totpDisable.consequences.title') }}
            </h4>
            <ul class="text-sm text-muted-foreground space-y-1">
              <li class="flex items-start gap-2">
                <Icon icon="lucide:x" class="h-4 w-4 mt-0.5 text-destructive" />
                {{ t('account.security.totpDisable.consequences.item1') }}
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="lucide:x" class="h-4 w-4 mt-0.5 text-destructive" />
                {{ t('account.security.totpDisable.consequences.item2') }}
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="lucide:x" class="h-4 w-4 mt-0.5 text-destructive" />
                {{ t('account.security.totpDisable.consequences.item3') }}
              </li>
            </ul>
          </div>

          <div class="flex gap-3">
            <Button variant="outline" class="flex-1" @click="closeDialog">
              {{ t('account.common.cancel') }}
            </Button>
            <Button
              variant="destructive"
              class="flex-1"
              :disabled="isLoading"
              @click="handleDisableAction"
            >
              <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
              <span v-else>{{
                t('account.security.totpDisable.confirm')
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
            {{ t('account.security.totpDisable.processing') }}
          </p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="isErrorStep" class="flex flex-col gap-6">
        <Alert variant="destructive">
          <Icon icon="lucide:alert-circle" />
          <AlertTitle>
            {{ t('account.security.totpDisable.error.title') }}
          </AlertTitle>
          <AlertDescription>
            {{
              errorMessage
              || t('account.security.totpDisable.error.description')
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
