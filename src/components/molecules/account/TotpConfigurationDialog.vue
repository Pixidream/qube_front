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
        <Icon icon="lucide:lock" />
        {{ t('account.security.totpConfigureButton') }}
      </Button>
    </DialogTrigger>
    <DialogContent
      class="sm:max-w-[425px]"
      @interact-outside="(e) => e.preventDefault()"
    >
      <DialogHeader>
        <DialogTitle>Configure TOTP</DialogTitle>
        <DialogDescription>
          You will be able to configure totp here :D
        </DialogDescription>
        <h1>To Implement !!</h1>
        <ol>
          <li>server need to have a route to handle password verification</li>
          <li>once password verified then we can request for totp</li>
        </ol>
      </DialogHeader>
      <DialogFooter>
        <Button> Submit </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
