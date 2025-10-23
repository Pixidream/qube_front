<script lang="ts" setup>
// import { useAuthMachine } from '@/machines/auth.machine';
// import { useAuthStore } from '@/stores/auth.stores';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/atoms/form';
import { Input } from '@components/atoms/input';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as z from 'zod';
import { createComponentLogger } from '@/utils/logger';
import isMobilePhone from 'validator/es/lib/isMobilePhone';

// Create component-specific logger
const profileFormLogger = createComponentLogger('LoginForm');

// const authStore = useAuthStore();
const { t } = useI18n();

profileFormLogger.debug('Initializing profile form component');
const formSchema = toTypedSchema(
  z.object({
    firstName: z
      .string({ error: () => t('account.profile.form.validation.firstName') })
      .optional(),
    lastName: z
      .string({ error: () => t('account.profile.form.validation.lastName') })
      .optional(),
    jobTitle: z
      .string({ error: () => t('account.profile.form.validation.jobTitle') })
      .optional(),
    phoneNumber: z
      .string({ error: () => t('account.profile.form.validation.phoneNumber') })
      .optional()
      .refine((phoneNumber) => isMobilePhone(phoneNumber ?? '')),
    username: z.string({
      error: () => t('account.profile.form.validation.username'),
    }),
    email: z
      .email({ error: () => t('auth.login.form.validation.email') })
      .min(2, { error: () => t('auth.login.form.validation.emailMinLength') })
      .max(250, {
        error: () => t('auth.login.form.validation.emailMaxLength'),
      }),
  }),
);
const { handleSubmit, handleReset, isFieldDirty } = useForm({
  validationSchema: formSchema,
});

const handleProfileUpdate = handleSubmit(async () => {});

onUnmounted(() => {
  profileFormLogger.debug('Profile form component unmounting', {
    action: 'component_unmount',
  });
  handleReset();
});
</script>
<template>
  <form class="flex flex-col gap-6" @submit="handleProfileUpdate">
    <div class="grid gap-6 grid-cols-1 md:grid-cols-2">
      <!-- Username -->
      <!-- hey claude, username how users will so you (display name) -->
      <div class="space-y-2">
        <FormField
          v-slot="{ componentField }"
          name="username"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('account.profile.form.username') }}
            </FormLabel>
            <FormControl>
              <Input
                tabindex="1"
                type="text"
                :placeholder="t('account.profile.form.usernamePlaceholder')"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- Email -->
      <div class="space-y-2">
        <FormField
          v-slot="{ componentField }"
          name="email"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('auth.login.form.emailLabel') }}
            </FormLabel>
            <FormControl>
              <Input
                tabindex="2"
                type="email"
                placeholder="john.doe@example.com"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- firstName -->
      <div class="space-y-2">
        <FormField
          v-slot="{ componentField }"
          name="firstName"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('account.profile.form.firstName') }}
            </FormLabel>
            <FormControl>
              <Input tabindex="3" type="text" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- lastName-->
      <div class="space-y-2">
        <FormField
          v-slot="{ componentField }"
          name="lastName"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('account.profile.form.lastName') }}
            </FormLabel>
            <FormControl>
              <Input tabindex="4" type="text" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- phoneNumber -->
      <div class="space-y-2">
        <FormField
          v-slot="{ componentField }"
          name="phoneNumber"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('account.profile.form.phoneNumber') }}
            </FormLabel>
            <FormControl>
              <Input tabindex="5" type="number" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- jobTitle -->
      <div class="space-y-2">
        <FormField
          v-slot="{ componentField }"
          name="jobTitle"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('account.profile.form.jobTitle') }}
            </FormLabel>
            <FormControl>
              <Input tabindex="6" type="text" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </div>
  </form>
</template>
