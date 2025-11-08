<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold">{{ t('pages.settings.title') }}</h1>
    <p class="text-muted-foreground mt-2">{{ t('pages.settings.subtitle') }}</p>
  </div>
</template>
