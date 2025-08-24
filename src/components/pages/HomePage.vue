<script setup lang="ts">
import { useAuthMachine } from '@/machines/auth.machine';
import Button from '@components/atoms/button/Button.vue';

const { send } = useAuthMachine();
const handleGoToLogin = () => {
  send({ type: 'LOGOUT' });
};
</script>
<template>
  <Button @click="handleGoToLogin">Login !!!!</Button>
</template>
