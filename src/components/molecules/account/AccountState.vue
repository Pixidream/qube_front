<script setup lang="ts">
import { useAuthStore } from '@stores/auth.stores';
import { Label } from '@components/atoms/label';
import { useI18n } from 'vue-i18n';
import { Badge } from '@components/atoms/badge';
import { computed } from 'vue';

const { t } = useI18n();
const authStore = useAuthStore();

const isActive = computed(() => authStore.user?.is_active ?? false);
const badgeColor = computed(() =>
  isActive.value ?
    'bg-green-700/25 text-green-500 border-green-500'
  : 'bg-destructive/25 text-destructive-foreground border-destructive-foreground',
);
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
    <Badge :class="badgeColor + ' px-4 rounded-full'">{{
      isActive ?
        t('account.settings.status.active')
      : t('account.settings.status.disabled')
    }}</Badge>
  </div>
</template>
