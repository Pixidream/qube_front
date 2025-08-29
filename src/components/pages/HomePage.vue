<script setup lang="ts">
import { useAuthMachine } from '@/machines/auth.machine';
import Button from '@components/atoms/button/Button.vue';

const authMachine = useAuthMachine();
const handleGoToLogin = () => {
  authMachine.actor.send({ type: 'LOGOUT' });
};
</script>
<template>
  <Button @click="handleGoToLogin">Login !!!!</Button>
</template>
