<script setup lang="ts">
import { Label } from '@components/atoms/label';
import DeleteAccountDialog from './DeleteAccountDialog.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
<template>
  <div
    class="flex items-start md:items-center flex-col md:flex-row gap-4 justify-between"
  >
    <div class="space-y-1">
      <Label class="text-md md:text-lg font-semibold text-destructive">
        {{ t('account.dangerZone.deleteAccount.label') }}
      </Label>
      <p class="text-muted-foreground text-sm">
        {{ t('account.dangerZone.deleteAccount.description') }}
      </p>
    </div>
    <DeleteAccountDialog />
  </div>
</template>
