<script setup lang="ts">
import { Toggle } from '@components/atoms/toggle';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { Separator } from '@components/atoms/separator';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const routes: {
  name: string;
  display: string;
  icon: string;
}[] = [
  {
    name: 'profile',
    display: t('navigation.profile'),
    icon: 'lucide:user',
  },
  {
    name: 'security',
    display: t('navigation.security'),
    icon: 'lucide:shield',
  },
];
</script>
<template>
  <div class="flex gap-4 h-full py-4">
    <div class="flex flex-col justify-start items-center gap-2 w-2/12">
      <Toggle
        v-for="r in routes"
        :key="r.name"
        class="w-full flex justify-start items-center"
        :data-state="route.name === r.name ? 'on' : 'off'"
        :data-pressed="route.name === r.name"
        @click.prevent="router.push({ name: r.name })"
      >
        <Icon :icon="r.icon" />
        {{ r.display }}
      </Toggle>
    </div>
    <Separator orientation="vertical" class="h-full" />
    <div class="grow w-10/12">
      <RouterView />
    </div>
  </div>
</template>
