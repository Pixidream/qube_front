<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@components/atoms/card';
import { Separator } from '@components/atoms/separator';
import PasswordResetItem from '@components/molecules/account/PasswordResetItem.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
<template>
  <Card>
    <CardHeader>
      <CardTitle> {{ t('account.security.title') }} </CardTitle>
      <CardDescription>
        {{ t('account.security.subtitle') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <PasswordResetItem />
        <Separator class="w-full" />
      </div>
    </CardContent>
  </Card>
</template>
