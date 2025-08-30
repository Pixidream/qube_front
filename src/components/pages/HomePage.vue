<script setup lang="ts">
import { useAuthMachine } from '@/machines/auth.machine';
import Button from '@components/atoms/button/Button.vue';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const authMachine = useAuthMachine();
const handleGoToLogin = () => {
  authMachine.actor.send({ type: 'LOGOUT' });
};
const isLoading = computed(() => authMachine.state.matches('form.loading'));
</script>
<template>
  <Button class="w-full" :disabled="isLoading" @click="handleGoToLogin()">
    <Icon v-if="isLoading" icon="svg-spinners:ring-resize" />
    <span v-else>Logout</span>
  </Button>
</template>
