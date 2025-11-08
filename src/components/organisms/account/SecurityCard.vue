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
import EmailUpdateDialog from '@components/molecules/account/EmailUpdateDialog.vue';
import EmailUpdateItem from '@components/molecules/account/EmailUpdateItem.vue';
import ChangeEmailForm from '@components/molecules/account/EmailUpdateForm.vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { createComponentLogger } from '@/utils/logger';
import { useUpdateEmailMachine } from '@/machines/emailUpdate.machine';
import { useTotpConfigurationMachine } from '@/machines/totpConfiguration.machine';

// Create component-specific logger
const securityCardLogger = createComponentLogger('SecurityCard');

const { t } = useI18n();
const { actor: totpConfigurationActor } = useTotpConfigurationMachine();
const { actor: updateEmailActor } = useUpdateEmailMachine();

onMounted(() => {
  securityCardLogger.debug('Security card mounted', {
    action: 'component_mounted',
    context: 'account_security',
  });
});
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
        <EmailUpdateItem>
          <EmailUpdateDialog>
            <template #password>
              <VerifyPasswordForm
                key="1"
                :actor="updateEmailActor"
                transition="EMAIL_UPDATE"
              />
            </template>
            <template #changeEmail>
              <ChangeEmailForm />
            </template>
          </EmailUpdateDialog>
        </EmailUpdateItem>
        <Separator class="w-full" />
        <PasswordResetItem>
          <PasswordResetDialog />
        </PasswordResetItem>
        <Separator class="w-full" />
        <TotpConfigurationItem>
          <TotpConfigurationDialog>
            <template #password>
              <VerifyPasswordForm
                key="2"
                :actor="totpConfigurationActor"
                transition="TOTP_CONFIG"
              />
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
