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
import ChangePasswordForm from './ChangePasswordForm.vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const { t } = useI18n();
const isDialogOpen = ref<boolean>(false);

const handleDialogClose = (open: boolean) => {
  isDialogOpen.value = open;
};
</script>

<template>
  <Dialog v-model:open="isDialogOpen" @update:open="handleDialogClose">
    <DialogTrigger as-child>
      <Button variant="outline">
        <Icon icon="lucide:key-round" />
        {{ t('account.security.changePasswordButton') }}
      </Button>
    </DialogTrigger>
    <DialogContent
      class="sm:max-w-[425px]"
      @interact-outside="(e) => e.preventDefault()"
    >
      <DialogHeader>
        <DialogTitle>
          {{ t('account.security.changePassword.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('account.security.changePassword.subtitle') }}
        </DialogDescription>
      </DialogHeader>
      <ChangePasswordForm @close="handleDialogClose(false)" />
    </DialogContent>
  </Dialog>
</template>
