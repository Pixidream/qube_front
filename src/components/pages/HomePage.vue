<script setup lang="ts">
import Button from '@components/atoms/button/Button.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const handleGoToLogin = () => {
  router.push({ name: 'login' });
};
</script>
<template>
  <Button @click="handleGoToLogin">Login !!!!</Button>
</template>
