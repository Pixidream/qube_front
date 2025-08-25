<script setup lang="ts">
import { useRoute } from 'vue-router';
import ResetPasswordForm from '@components/molecules/authentication/ResetPasswordForm.vue';
import SendPasswordResetForm from '@components/molecules/authentication/SendPasswordResetForm.vue';
import { computed } from 'vue';

const route = useRoute();
const isResetForm = computed(() => route.query?.token && route.query?.type);
</script>

<template>
  <ResetPasswordForm v-if="isResetForm" />
  <SendPasswordResetForm v-else />
</template>
