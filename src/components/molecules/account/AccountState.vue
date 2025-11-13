<script setup lang="ts">
import { useAuthStore } from '@stores/auth.stores';
import { Label } from '@components/atoms/label';
import { Switch } from '@components/atoms/switch';
import { useI18n } from 'vue-i18n';
import { Badge } from '@components/atoms/badge';
import DeactivateAccountDialog from './DeactivateAccountDialog.vue';
import { computed, ref, watch, onMounted } from 'vue';
import { createComponentLogger } from '@/utils/logger';

const accountStateLogger = createComponentLogger('AccountState');

const { t } = useI18n();
const authStore = useAuthStore();

const isActive = computed(() => authStore.user?.is_active ?? false);
const badgeColor = computed(() =>
  isActive.value ?
    'bg-green-700/25 text-green-500 border-green-500'
  : 'bg-destructive/25 text-destructive-foreground border-destructive-foreground',
);

const isDialogOpen = ref<boolean>(false);
const switchValue = ref<boolean>(false);

// Initialize switch value after mount
onMounted(() => {
  switchValue.value = isActive.value;
  accountStateLogger.debug('AccountState mounted', {
    action: 'component_mounted',
    isActive: isActive.value,
    switchValue: switchValue.value,
  });
});

// Keep switch in sync with user state
watch(isActive, (newValue) => {
  accountStateLogger.debug('isActive changed', {
    action: 'is_active_changed',
    newValue,
    oldValue: switchValue.value,
  });
  switchValue.value = newValue;
});

const handleSwitchChange = (checked: boolean) => {
  accountStateLogger.info('Account status switch toggled', {
    action: 'switch_toggled',
    newState: checked,
    previousState: isActive.value,
    currentSwitchValue: switchValue.value,
  });

  // Only open dialog when deactivating (switching from true to false)
  if (!checked && isActive.value) {
    accountStateLogger.info('Opening deactivation dialog', {
      action: 'open_deactivation_dialog',
    });
    isDialogOpen.value = true;
  } else {
    accountStateLogger.warn('Switch change prevented', {
      action: 'switch_change_prevented',
      checked,
      isActive: isActive.value,
    });
    // Reset switch if user tries to activate (not supported)
    switchValue.value = isActive.value;
  }
};
</script>
<template>
  <div
    class="flex items-start md:items-center flex-col md:flex-row gap-4 justify-between"
  >
    <div class="space-y-1">
      <Label class="text-md md:text-lg font-semibold">{{
        t('account.settings.status.title')
      }}</Label>
      <p class="text-muted-foreground text-sm">
        {{
          isActive ?
            t('account.settings.status.activeSubtitle')
          : t('account.settings.status.disabledSubtitle')
        }}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Switch v-model="switchValue" @update:model-value="handleSwitchChange" />
      <Badge :class="badgeColor + ' px-4 rounded-full'">{{
        isActive ?
          t('account.settings.status.active')
        : t('account.settings.status.disabled')
      }}</Badge>
    </div>
  </div>

  <DeactivateAccountDialog v-model:open="isDialogOpen">
    <template #trigger>
      <span />
    </template>
  </DeactivateAccountDialog>
</template>
