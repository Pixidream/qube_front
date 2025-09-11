<script setup lang="ts">
import PasswordResetDialog from '@/components/molecules/account/PasswordResetDialog.vue';
import TotpConfigurationDialog from '@/components/molecules/account/TotpConfigurationDialog.vue';
import VerifyPasswordForm from '@/components/molecules/account/VerifyPasswordForm.vue';
import TotpConfigurationForm from '@/components/molecules/account/TotpConfigurationForm.vue';
import TotpRecoveryCodesForm from '@/components/molecules/account/TotpRecoveryCodesForm.vue';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@components/atoms/card';
import { Separator } from '@components/atoms/separator';
import PasswordResetItem from '@components/molecules/account/PasswordResetItem.vue';
import TotpConfigurationItem from '@components/molecules/account/TotpConfigurationItem.vue';
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
        <PasswordResetItem>
          <PasswordResetDialog />
        </PasswordResetItem>
        <Separator class="w-full" />
        <TotpConfigurationItem>
          <TotpConfigurationDialog>
            <template #password>
              <VerifyPasswordForm />
            </template>
            <template #totp>
              <TotpConfigurationForm />
            </template>
            <template #recovery>
              <TotpRecoveryCodesForm />
            </template>
          </TotpConfigurationDialog>
        </TotpConfigurationItem>
      </div>
    </CardContent>
  </Card>
</template>
