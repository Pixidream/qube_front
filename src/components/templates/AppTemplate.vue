<script setup lang="ts">
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@components/atoms/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@components/atoms/breadcrumb';
import { Separator } from '@components/atoms/separator';
import SidebarApp from '@components/organisms/sidebar/SidebarApp.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
</script>
<template>
  <SidebarProvider>
    <SidebarApp />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4!" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem
                class="hidden md:block"
                @click="router.push({ name: 'home' })"
              >
                <BreadcrumbLink href="#">
                  {{ t('app.name') }}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator
                v-if="route.name !== 'home'"
                class="hidden md:block"
              />
              <BreadcrumbItem v-if="route.name !== 'home'">
                <BreadcrumbPage>{{ route.meta.displayName }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
