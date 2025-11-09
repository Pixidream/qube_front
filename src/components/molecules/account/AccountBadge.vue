<script lang="ts" setup>
import { Skeleton } from '@components/atoms/skeleton';
import { Badge } from '@components/atoms/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/atoms/hover-card';
import { Avatar, AvatarImage, AvatarFallback } from '@components/atoms/avatar';
import { useAuthStore } from '@/stores/auth.stores';

const authStore = useAuthStore();
const user = authStore.user;
</script>
<template>
  <HoverCard v-if="user">
    <HoverCardTrigger>
      <Badge variant="outline" class="cursor-pointer">
        @{{ user?.username }}
      </Badge>
    </HoverCardTrigger>
    <HoverCardContent>
      <div class="flex w-full h-full gap-4">
        <div class="flex-grow-0">
          <Avatar class="h-12 w-12 rounded-lg">
            <AvatarImage
              :src="authStore.getAvatar"
              :alt="`${authStore.getDisplayName}'s avatar`"
            />
            <AvatarFallback class="rounded-lg">{{
              authStore.getAvatarFallback
            }}</AvatarFallback>
          </Avatar>
        </div>
        <div
          class="flex-grow-1 flex flex-col justify-center items-start max-w-full text-ellipsis whitespace-nowrap overflow-x-hidden"
        >
          <p class="font-bold text-sm">{{ authStore.getDisplayName }}</p>
          <p class="text-muted-foreground text-xs">
            {{ authStore.user?.email }}
          </p>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
  <Skeleton v-else class="h-4 w-24 rounded-md" />
</template>
