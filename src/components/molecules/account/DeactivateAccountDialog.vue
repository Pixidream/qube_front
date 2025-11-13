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
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import { createComponentLogger } from '@/utils/logger';

const deactivateAccountLogger = createComponentLogger(
  'DeactivateAccountDialog',
);

const authStore = useAuthStore();
const { t } = useI18n();

const isDialogOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const handleDeactivate = async () => {
  deactivateAccountLogger.info('User confirmed account deactivation', {
    action: 'confirm_deactivation',
  });

  isLoading.value = true;

  try {
    const success = await authStore.deactivateAccount();

    if (success) {
      deactivateAccountLogger.info('Account deactivation successful', {
        action: 'deactivation_success',
      });
      toast.success(t('account.settings.status.deactivate.success'));
      isDialogOpen.value = false;
    } else {
      deactivateAccountLogger.warn('Account deactivation failed', {
        action: 'deactivation_failed',
      });
      toast.error(t('account.settings.status.deactivate.error'));
    }
  } catch (err) {
    deactivateAccountLogger.error('Account deactivation error', err as Error, {
      action: 'deactivation_error',
    });
    toast.error(t('account.settings.status.deactivate.error'));
  } finally {
    isLoading.value = false;
  }
};

const openDialog = () => {
  deactivateAccountLogger.info('Opening account deactivation dialog', {
    action: 'open_dialog',
  });
  isDialogOpen.value = true;
};

const closeDialog = () => {
  deactivateAccountLogger.info('Closing account deactivation dialog', {
    action: 'close_dialog',
  });
  isDialogOpen.value = false;
};
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <slot name="trigger" :open-dialog="openDialog" />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {{ t('account.settings.status.deactivate.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('account.settings.status.deactivate.subtitle') }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-6">
        <Alert>
          <Icon icon="lucide:info" />
          <AlertTitle>
            {{ t('account.settings.status.deactivate.info.title') }}
          </AlertTitle>
          <AlertDescription>
            {{ t('account.settings.status.deactivate.info.description') }}
          </AlertDescription>
        </Alert>

        <div class="space-y-3">
          <h4 class="font-medium text-sm">
            {{ t('account.settings.status.deactivate.consequences.title') }}
          </h4>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li class="flex items-start gap-2">
              <Icon icon="lucide:check" class="h-4 w-4 mt-0.5 text-primary" />
              {{ t('account.settings.status.deactivate.consequences.item1') }}
            </li>
            <li class="flex items-start gap-2">
              <Icon icon="lucide:check" class="h-4 w-4 mt-0.5 text-primary" />
              {{ t('account.settings.status.deactivate.consequences.item2') }}
            </li>
            <li class="flex items-start gap-2">
              <Icon icon="lucide:check" class="h-4 w-4 mt-0.5 text-primary" />
              {{ t('account.settings.status.deactivate.consequences.item3') }}
            </li>
          </ul>
        </div>

        <div class="flex gap-3">
          <Button
            variant="outline"
            class="flex-1"
            :disabled="isLoading"
            @click="closeDialog"
          >
            {{ t('account.common.cancel') }}
          </Button>
          <Button
            variant="default"
            class="flex-1"
            :disabled="isLoading"
            @click="handleDeactivate"
          >
            <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
            <span v-else>{{
              t('account.settings.status.deactivate.confirm')
            }}</span>
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
