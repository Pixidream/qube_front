<script setup lang="ts">
import { Label } from '@components/atoms/label';
import { useI18n } from 'vue-i18n';
import { Badge } from '@components/atoms/badge';
import { useAuthStore } from '@/stores/auth.stores';
import TotpRegenerateCodesDialog from './TotpRegenerateCodesDialog.vue';
import TotpDisableDialog from './TotpDisableDialog.vue';

const { t } = useI18n();
const authStore = useAuthStore();
</script>
<template>
  <div
    class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
  >
    <div class="space-y-1">
      <Label class="text-md md:text-lg font-semibold">{{
        t('account.security.totp')
      }}</Label>
      <p class="text-muted-foreground text-sm">
        {{ t('account.security.totpSubtitle') }}
      </p>
    </div>
    <div class="flex items-start gap-2 flex-col md:flex-row md:items-center">
      <Badge
        :variant="authStore.user?.totp_enabled ? 'default' : 'destructive'"
        >{{
          t(
            authStore.user?.totp_enabled ?
              'account.security.totpEnabled'
            : 'account.security.totpDisabled',
          )
        }}</Badge
      >

      <!-- If TOTP is disabled, show configuration slot -->
      <slot v-if="!authStore.user?.totp_enabled" />

      <!-- If TOTP is enabled, show management buttons -->
      <div v-else class="flex items-center gap-2">
        <TotpRegenerateCodesDialog />
        <TotpDisableDialog />
      </div>
    </div>
  </div>
</template>
