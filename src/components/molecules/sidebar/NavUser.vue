<script setup lang="ts">
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from 'lucide-vue-next';

import { Avatar, AvatarFallback, AvatarImage } from '@components/atoms/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/atoms/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/atoms/sidebar';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth.stores';
import { useAuthMachine } from '@/machines/auth.machine';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ThemeToggle from '@components/molecules/utils/ThemeToggle.vue';

const authStore = useAuthStore();
const { isMobile } = useSidebar();
const authMachine = useAuthMachine();
const { t } = useI18n();

const isLoading = computed<boolean>(() =>
  authMachine.state.matches('form.loading'),
);

const handleLogout = (event: Event) => {
  event.preventDefault();
  authMachine.actor.send({ type: 'LOGOUT' });
};
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage
                :src="authStore.getAvatar"
                :alt="`${authStore.getDisplayName}'s avatar`"
              />
              <AvatarFallback class="rounded-lg">{{
                authStore.getAvatarFallback
              }}</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">
                {{ authStore.getDisplayName }}</span
              >
              <span class="truncate text-xs">{{ authStore.user?.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage
                  :src="authStore.getAvatar"
                  :alt="`${authStore.getDisplayName}'s avatar`"
                />
                <AvatarFallback class="rounded-lg">{{
                  authStore.getAvatarFallback
                }}</AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold max-w-4/5">
                  {{ authStore.getDisplayName }}
                </span>
                <span class="truncate text-xs">{{
                  authStore.user?.email
                }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem @select.prevent="">
              <ThemeToggle class="max-h-5" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem :disabled="isLoading" @select="handleLogout">
            <template v-if="isLoading">
              <Icon icon="svg-spinners:ring-resize" />
              {{ t('navbar.navuser.disconnecting') }}
            </template>
            <template v-else>
              <LogOut />
              {{ t('navbar.navuser.logout') }}
            </template>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
