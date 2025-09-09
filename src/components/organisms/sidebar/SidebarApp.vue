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

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
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
