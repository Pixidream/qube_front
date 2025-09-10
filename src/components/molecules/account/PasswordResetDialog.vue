<script setup lang="ts">
import { Button } from '@components/atoms/button';
import { Icon } from '@iconify/vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/atoms/dialog';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
<template>
  <Dialog>
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
        <DialogTitle>Change PAssword</DialogTitle>
        <DialogDescription>
          You will be able to change password here :D
        </DialogDescription>
        <h1>To Implement !!</h1>
      </DialogHeader>
      <DialogFooter>
        <Button> Save changes </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
