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

const authStore = useAuthStore();
const { t } = useI18n();

const isDialogOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const handleDisable = async () => {
  isLoading.value = true;
  const success = await authStore.disableTotp();

  if (success) {
    isDialogOpen.value = false;
    toast.success(t('account.security.totpDisable.success'));
  } else {
    toast.error(t('account.security.totpDisable.error'));
  }

  isLoading.value = false;
};
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogTrigger as-child>
      <Button variant="destructive" size="sm">
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
            @click="handleDisable"
          >
            <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
            <span v-else>{{ t('account.security.totpDisable.confirm') }}</span>
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
