<script setup lang="ts">
import { Label } from '@components/atoms/label';
import { useI18n } from 'vue-i18n';
import dayjs from '@/plugins/dayjs.plugin';
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.stores';

const { t } = useI18n();
const authStore = useAuthStore();

const passwordLastChanged = computed(() =>
  authStore.user?.password_updated ?
    t('account.security.lastChanged', {
      timeSince: dayjs(authStore.user?.password_updated).fromNow(),
    })
  : t('account.security.neverChanged'),
);
</script>
<template>
  <div class="flex items-center justify-between">
    <div class="space-y-1">
      <Label>{{ t('account.security.password') }}</Label>
      <p class="text-muted-foreground text-sm">{{ passwordLastChanged }}</p>
    </div>
    <slot />
  </div>
</template>
