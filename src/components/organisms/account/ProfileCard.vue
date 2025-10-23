<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@components/atoms/card';
// import { Separator } from '@components/atoms/separator';
import ProfileForm from '@components/molecules/account/ProfileForm.vue';
import { useI18n } from 'vue-i18n';
// import { createComponentLogger } from '@/utils/logger';

// Create component-specific logger
// const profileCardLogger = createComponentLogger('ProfileCard');

const { t } = useI18n();
</script>
<template>
  <Card>
    <CardHeader>
      <CardTitle> {{ t('account.profile.title') }} </CardTitle>
      <CardDescription>
        {{ t('account.profile.subtitle') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ProfileForm />
    </CardContent>
  </Card>
</template>
