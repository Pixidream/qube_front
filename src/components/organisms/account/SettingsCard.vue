<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@components/atoms/card';
import { Separator } from '@components/atoms/separator';
import AccountState from '@components/molecules/account/AccountState.vue';
import DeleteAccount from '@components/molecules/account/DeleteAccount.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
<template>
  <Card>
    <CardHeader>
      <CardTitle> {{ t('account.settings.title') }} </CardTitle>
      <CardDescription>
        {{ t('account.settings.subtitle') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Normal settings -->
      <div class="space-y-4">
        <AccountState />
        <Separator class="w-full" />
      </div>

      <!-- Danger zone -->
      <div
        class="w-[calc(100% + 1.5rem)] border-1 border-solid border-destructive -mx-6 -mb-6 rounded-xl py-6"
      >
        <CardHeader class="mb-4">
          <CardTitle class="text-destructive">
            {{ t('account.dangerZone.title') }}
          </CardTitle>
          <CardDescription class="text-destructive">
            {{ t('account.dangerZone.subtitle') }}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div class="space-y-4">
            <DeleteAccount />
            <Separator class="w-full" />
          </div>
        </CardContent>
      </div>
    </CardContent>
  </Card>
</template>
