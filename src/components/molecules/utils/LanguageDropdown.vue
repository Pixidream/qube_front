<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Button } from '@components/atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/atoms/dropdown-menu';
import { useI18n } from 'vue-i18n';
import { type SupportedLocale, localeNames, icons } from '@i18n/index';

const { locale, availableLocales } = useI18n<{ locale: SupportedLocale }>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <Icon
          :icon="icons[locale as SupportedLocale]"
          class="h-[1.2rem] w-[1.2rem]"
        />
        <span>{{ localeNames[locale as SupportedLocale] }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        v-for="loc of availableLocales"
        :key="loc"
        @click="locale = loc"
      >
        <Icon
          :icon="icons[loc as SupportedLocale]"
          class="h-[1.2rem] w-[1.2rem]"
        />

        <span>{{ localeNames[loc as SupportedLocale] }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
