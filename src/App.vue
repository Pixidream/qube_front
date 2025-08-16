<script setup lang="ts">
import { useColorMode } from '@vueuse/core';

useColorMode();
</script>

<template>
  <div class="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
    <RouterView />
  </div>
</template>

<style scoped></style>
