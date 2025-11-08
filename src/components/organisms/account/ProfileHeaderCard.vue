<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Card, CardContent } from '@components/atoms/card';
import { Button } from '@components/atoms/button';
import { Badge } from '@components/atoms/badge';
import { useAuthStore } from '@/stores/auth.stores';
import { useI18n } from 'vue-i18n';
import dayjs from '@/plugins/dayjs.plugin';
import AvatarEditor from '@components/molecules/account/AvatarEditor.vue';
import { computed, onMounted } from 'vue';
import { createComponentLogger } from '@/utils/logger';

// Create component-specific logger
const profileCardLogger = createComponentLogger('ProfileHeaderCard');

const authStore = useAuthStore();
const { t, locale } = useI18n();

const getFormatedDate = computed<string>(() => {
  // @ts-expect-error trigger the computed when local is changed
  // eslint-disable-next-line
  const _loc = locale.value;
  return dayjs(authStore.user?.email_verified).format('DD MMMM YYYY');
});

onMounted(() => {
  profileCardLogger.debug('Profile card mounted', {
    action: 'component_mounted',
    hasUser: !!authStore.user,
    userId: authStore.user?.id,
    displayName: authStore.getDisplayName,
  });
});
</script>
<template>
  <Card>
    <CardContent>
      <div
        class="flex flex-wrap flex-col items-start gap-6 md:flex-row md:items-center"
      >
        <AvatarEditor
          :src="authStore.getAvatar"
          :alt="`${authStore.getDisplayName}'s avatar`"
        />
        <div class="flex-1 space-y-2">
          <div class="flex flex-col gap-2 md:flex-row md:items-center">
            <h1 class="text-2xl font-bold">{{ authStore.getDisplayName }}</h1>
            <Badge>{{ t('account.accountType.enterprise') }}</Badge>
          </div>
          <p class="text-muted-foreground">{{ authStore.user?.job_title }}</p>
          <div class="text-muted-foreground flex flex-wrap gap-4 text-sm">
            <div class="flex items-center gap-2">
              <Icon icon="lucide:mail" class="size-4" />
              <span>{{ authStore.user?.email }}</span>
            </div>
            <div
              v-if="authStore.user?.phone_number"
              class="flex items-center gap-2"
            >
              <Icon icon="lucide:phone" class="size-4" />
              <span>{{ authStore.user?.phone_number }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon icon="lucide:calendar" class="size-4" />
              <span>{{
                t('auth.profile.joined', {
                  date: getFormatedDate,
                })
              }}</span>
            </div>
          </div>
        </div>
        <Button>{{ t('auth.profile.edit') }}</Button>
      </div>
    </CardContent>
  </Card>
</template>
