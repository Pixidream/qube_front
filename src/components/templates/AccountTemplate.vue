<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ProfileCard from '@components/organisms/account/ProfileCard.vue';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/atoms/tabs';
import accountRoutes from '@router/routes/account';
import { type RouteMeta } from '@core/types/router';
import { type RouteRecordNameGeneric, useRouter } from 'vue-router';
import { computed } from 'vue';

const { t } = useI18n();
const router = useRouter();

const currentTab = computed(() => router.currentRoute.value.name);

const handleTrigger = (routeName: RouteRecordNameGeneric) => {
  router.push({ name: routeName });
};
</script>
<template>
  <div class="container mx-auto space-y-6 px-4 py-10">
    <ProfileCard />
    <div>
      <Tabs :model-value="currentTab as string" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger
            v-for="accountRoute of accountRoutes[0].children"
            :key="accountRoute.name"
            :value="accountRoute.name as string"
            @click="handleTrigger(accountRoute.name)"
          >
            {{
              t((accountRoute.meta as RouteMeta | undefined)?.displayName ?? '')
            }}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          v-for="accountRoute of accountRoutes[0].children"
          :key="accountRoute.name"
          :value="accountRoute.name as string"
        >
          <RouterView :key="accountRoute.name" />
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
