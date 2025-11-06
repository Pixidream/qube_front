<script lang="ts" setup>
import { MIN_EXEC_TIME_MS } from '@/core/constants/auth.constants';
import { useAuthStore } from '@/stores/auth.stores';
import { Button } from '@components/atoms/button';
import { Input } from '@components/atoms/input';
import { Icon } from '@iconify/vue';
import { ref, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import { useAuthMachine } from '@/machines/auth.machine';
import { createComponentLogger } from '@/utils/logger';

const verifyEmailBodyLogger = createComponentLogger('VerifyEmailBody');
const authStore = useAuthStore();
const authMachine = useAuthMachine();
const emailVerified = ref<boolean | null>(null);
const email = ref<string>('');
const sendingEmail = ref(false);

const handleResendEmail = async () => {
  verifyEmailBodyLogger.debug('handling resend email');
  sendingEmail.value = true;
  await new Promise((resolve) => setTimeout(resolve, MIN_EXEC_TIME_MS));
  const sent = await authStore.resendVerificationEmail(email.value);

  if (sent) {
    toast.info('A new mail has been sent.');
    email.value = '';
  } else {
    toast.error(
      'Failed to send a new verification email. Try again in a minute',
    );
  }

  sendingEmail.value = false;
};

onMounted(async () => {
  verifyEmailBodyLogger.debug('Mounting VerifyEmailBody component');
  const token = authMachine.actor.getSnapshot().context.query.token;

  verifyEmailBodyLogger.debug(`Found token:'${token}'`);

  if (!token) {
    emailVerified.value = false;
  }

  const verified = await authStore.verifyEmail({ token });
  emailVerified.value = verified;

  if (verified) {
    setTimeout(() => authMachine.actor.send({ type: 'LOGIN' }), 2500);
  }
});
</script>
<template>
  <div class="flex flex-col flex-1 w-full justify-center items-center">
    <!-- loading -->
    <div
      v-if="emailVerified === null"
      class="flex flex-col flex-1 w-full justify-center items-center"
    >
      <p class="font-bold text-xl md:text-2xl text-center">Verifying email</p>
      <p
        class="font-semibold text-lg md:text-xl text-muted-foreground text-center mt-4"
      >
        We are verifying your email, you will be redirected very soon !
      </p>
      <Icon class="mt-8 h-12 w-12" icon="svg-spinners:ring-resize" />
    </div>

    <!-- Success -->
    <div
      v-else-if="emailVerified"
      class="flex flex-col flex-1 w-full justify-center items-center"
    >
      <p class="font-bold text-xl md:text-2xl text-center">Verifying email</p>
      <p
        class="font-semibold text-lg md:text-xl text-muted-foreground text-center mt-4"
      >
        Email verified ! You can now log into your account.
      </p>
      <Icon
        class="mt-8 h-12 w-12 text-green-500"
        icon="lucide:circle-check-big"
      />
    </div>

    <!-- Error -->
    <div v-else class="flex flex-col flex-1 w-full justify-center items-center">
      <p class="font-bold text-xl md:text-2xl text-center">
        Verification failed
      </p>
      <p
        class="font-semibold text-lg md:text-xl text-muted-foreground text-center mt-4"
      >
        We failed to verify your email.
      </p>
      <Icon class="mt-8 h-12 w-12 text-destructive" icon="lucide:circle-x" />
      <div class="flex w-full mt-8 justify-center items-center">
        <form
          class="flex flex-col w-full justify-center items-center"
          @submit.prevent="handleResendEmail"
        >
          <Input
            v-model="email"
            :disabled="sendingEmail"
            placeholder="john.doe@example.com"
            type="email"
            required
          />
          <Button
            :disabled="sendingEmail"
            type="submit"
            variant="outline"
            class="mt-4"
          >
            <Icon v-if="sendingEmail" icon="svg-spinners:ring-resize" />
            <Icon v-else icon="lucide:send-horizontal" class="mr-2" />
            <span>Send a new email</span>
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
