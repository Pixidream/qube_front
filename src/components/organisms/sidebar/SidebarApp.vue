<script setup lang="ts">
import {
  type SidebarProps,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@components/atoms/sidebar';
import TeamSwitcher from '@components/molecules/sidebar/TeamSwitcher.vue';
import NavUser from '@components/molecules/sidebar/NavUser.vue';
import { createComponentLogger } from '@/utils/logger';
import { onMounted } from 'vue';

// Create component-specific logger
const sidebarLogger = createComponentLogger('SidebarApp');

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
});

onMounted(() => {
  sidebarLogger.debug('Sidebar app mounted', {
    action: 'component_mounted',
    collapsible: props.collapsible,
    variant: props.variant,
    side: props.side,
  });
});
</script>
<template>
  <Sidebar v-bind="props">
    <SidebarHeader class="sidebar-header-padding"
      ><TeamSwitcher
    /></SidebarHeader>
    <SidebarContent></SidebarContent>
    <SidebarFooter class="sidebar-footer-padding"><NavUser /></SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
<style scoped>
.sidebar-header-padding {
  padding-top: calc(env(safe-area-inset-top) + var(--spacing) * 2);
}
.sidebar-footer-padding {
  padding-bottom: calc(env(safe-area-inset-bottom) + var(--spacing) * 2);
}
</style>
