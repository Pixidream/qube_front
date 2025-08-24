<script setup lang="ts">
import LoginCard from '@/components/organisms/authentication/LoginCard.vue';
import { useAuthMachine } from '@/machines/auth.machine';
import { onMounted } from 'vue';

const authMachine = useAuthMachine();

onMounted(async () => {
  if (authMachine.state.value !== 'login') {
    authMachine.actor.stop();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    authMachine.actor.start();
  }
});
</script>
<template>
  <LoginCard />
</template>
