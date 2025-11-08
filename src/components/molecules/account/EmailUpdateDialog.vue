<script setup lang="ts">
import { Button } from '@components/atoms/button';
import { Icon } from '@iconify/vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/atoms/dialog';
import { useI18n } from 'vue-i18n';
import { useUpdateEmailMachine } from '@machines/emailUpdate.machine';
import { useAuthStore } from '@/stores/auth.stores';
import { ref, computed } from 'vue';
import { onMounted } from 'vue';
import { Subscription } from 'xstate';
import { onUnmounted } from 'vue';

const { actor } = useUpdateEmailMachine();
const authStore = useAuthStore();
const { t } = useI18n();
const isPasswordVerification = ref<boolean>(true);
let unsubscribe: Subscription | null;

const title = computed(() => {
  if (isPasswordVerification.value) {
    return t('account.security.passwordVerifyForm.title');
  } else {
    return t('account.security.changeEmail.title');
  }
});

const subtitle = computed(() => {
  if (isPasswordVerification.value) {
    return t('account.security.passwordVerifyForm.subtitle');
  } else {
    return t('account.security.changeEmail.subtitle');
  }
});

const isDialogOpen = ref<boolean>(false);

const handleDialogClose = (open: boolean) => {
  if (!open) {
    actor.send({ type: 'RESET' });
    authStore.clearTotpRecoveryCodes();
  }
  isDialogOpen.value = open;
};

onMounted(() => {
  unsubscribe = actor.subscribe((snapshot) => {
    isPasswordVerification.value = snapshot.matches('flow.password_verify');
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe.unsubscribe();
});
</script>
<template>
  <Dialog v-model:open="isDialogOpen" @update:open="handleDialogClose">
    <DialogTrigger as-child>
      <Button variant="outline">
        <Icon icon="lucide:mail" />
        {{ t('account.security.changeEmailButton') }}
      </Button>
    </DialogTrigger>
    <DialogContent
      class="sm:max-w-[425px]"
      @interact-outside="(e) => e.preventDefault()"
    >
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ subtitle }}
        </DialogDescription>
      </DialogHeader>
      <slot v-if="isPasswordVerification" name="password" />
      <slot v-else name="changeEmail" />
    </DialogContent>
  </Dialog>
</template>
