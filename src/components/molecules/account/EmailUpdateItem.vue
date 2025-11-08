<script setup lang="ts">
import { Label } from '@components/atoms/label';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
<template>
  <div
    class="flex items-start md:items-center flex-col md:flex-row gap-4 justify-between"
  >
    <div class="space-y-1">
      <Label class="text-md md:text-lg font-semibold">{{
        t('account.security.email')
      }}</Label>
      <p class="text-muted-foreground text-sm">
        {{ t('account.security.emailSubtitle') }}
      </p>
    </div>
    <slot />
  </div>
</template>
