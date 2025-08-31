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
    <SidebarHeader><TeamSwitcher /></SidebarHeader>
    <SidebarContent></SidebarContent>
    <SidebarFooter><NavUser /></SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
