<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth.stores';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/atoms/form';
import { Button } from '@components/atoms/button';
import { Input } from '@components/atoms/input';
import { Icon } from '@iconify/vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { onUnmounted, watch, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as z from 'zod';
import { createComponentLogger } from '@/utils/logger';
import {
  AsYouType,
  isValidPhoneNumber,
  isPossiblePhoneNumber,
} from 'libphonenumber-js';
import { UpdateUserBody } from '@/core/types/auth';
import { useRouter } from 'vue-router';

// Create component-specific logger
const profileFormLogger = createComponentLogger('LoginForm');

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
let formatTimeout: NodeJS.Timeout | null = null;
const initialValues = {
  username: authStore.user?.username,
  first_name: authStore.user?.first_name,
  last_name: authStore.user?.last_name,
  job_title: authStore.user?.job_title,
  phone_number: authStore.user?.phone_number,
  email: authStore.user?.email,
};
const saving = ref(false);
type FormValues = typeof initialValues;
type FormFieldNames = keyof FormValues;

profileFormLogger.debug('Initializing profile form component');
const formSchema = toTypedSchema(
  z.object({
    first_name: z
      .string({ error: () => t('account.profile.form.validation.firstName') })
      .optional()
      .nullable(),
    last_name: z
      .string({ error: () => t('account.profile.form.validation.lastName') })
      .optional()
      .nullable(),
    job_title: z
      .string({ error: () => t('account.profile.form.validation.jobTitle') })
      .optional()
      .nullable(),
    phone_number: z
      .string({ error: () => t('account.profile.form.validation.phoneNumber') })
      .optional()
      .nullable()
      .refine(
        (phoneNumber) =>
          phoneNumber ?
            isValidPhoneNumber(phoneNumber)
            && isPossiblePhoneNumber(phoneNumber)
          : true,
        { error: () => t('account.profile.form.validation.phoneNumber') },
      ),
    username: z
      .string({
        error: () => t('account.profile.form.validation.username'),
      })
      .optional()
      .nullable(),
    email: z
      .email({ error: () => t('auth.login.form.validation.email') })
      .min(2, { error: () => t('auth.login.form.validation.emailMinLength') })
      .max(250, {
        error: () => t('auth.login.form.validation.emailMaxLength'),
      }),
  }),
);
const { handleSubmit, handleReset, isFieldDirty, values, setFieldValue, meta } =
  useForm({
    validationSchema: formSchema,
    initialValues,
  });

const saveDisabled = computed(
  () =>
    (meta.value.valid && !meta.value.dirty)
    || authStore.updatingProfile
    || saving.value,
);

const formatPhoneDisplay = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const cursorPosition = input.selectionStart || 0;

  if (formatTimeout) {
    clearTimeout(formatTimeout);
  }

  formatTimeout = setTimeout(() => {
    const formatter = new AsYouType();
    const formatted = formatter.input(input.value);

    profileFormLogger.debug(
      `Formatted phone number from '${input.value} to '${formatted}'`,
    );

    if (input.value !== formatted) {
      const oldLength = input.value.length;
      input.value = formatted;

      const lengthDiff = formatted.length - oldLength;
      const newPosition = Math.min(
        cursorPosition + lengthDiff,
        formatted.length,
      );

      input.setSelectionRange(newPosition, newPosition);
    }
  }, 1000);
};

const handleProfileUpdate = handleSubmit(async (values) => {
  saving.value = true;
  const modifiedValues = (Object.keys(values) as FormFieldNames[])
    .filter((key) => isFieldDirty(key))
    .reduce(
      (obj, key) => {
        obj[key] = values[key];
        return obj;
      },
      {} as Record<FormFieldNames, any>,
    );

  profileFormLogger.debug('filtered field to submit', {
    action: 'update_user',
    fields: modifiedValues,
  });

  await authStore.updateProfile(modifiedValues as UpdateUserBody);

  await new Promise((resolve) => setTimeout(resolve, 150));

  handleReset();

  (Object.keys(modifiedValues) as FormFieldNames[]).forEach((key) => {
    setFieldValue(key, authStore.user ? authStore.user[key] : null);
  });

  saving.value = false;
});

watch(
  values,
  (newValues) => {
    (Object.keys(newValues) as FormFieldNames[]).forEach((key) => {
      if (newValues[key] === '' || newValues[key] === undefined) {
        setFieldValue(key, null);
      }
    });
  },
  { deep: true },
);

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
                :class="{ 'border-foreground': isFieldDirty('username') }"
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
              <span class="text-muted-foreground mx-4">-</span>
              <Button
                class="h-4 cursor-pointer rounded-sm"
                @click="router.push({ name: 'security' })"
                >{{ t('account.profile.form.emailSubtitle') }}</Button
              >
            </FormLabel>
            <FormControl>
              <Input
                tabindex="2"
                type="email"
                placeholder="john.doe@example.com"
                v-bind="componentField"
                :class="{ 'border-foreground': isFieldDirty('email') }"
                disabled
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
          name="first_name"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('account.profile.form.firstName') }}
            </FormLabel>
            <FormControl>
              <Input
                tabindex="3"
                type="text"
                v-bind="componentField"
                :class="{ 'border-foreground': isFieldDirty('first_name') }"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- lastName-->
      <div class="space-y-2">
        <FormField
          v-slot="{ componentField }"
          name="last_name"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('account.profile.form.lastName') }}
            </FormLabel>
            <FormControl>
              <Input
                tabindex="4"
                type="text"
                v-bind="componentField"
                :class="{ 'border-foreground': isFieldDirty('last_name') }"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- phoneNumber -->
      <div class="space-y-2">
        <FormField
          v-slot="{ componentField }"
          name="phone_number"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('account.profile.form.phoneNumber') }}
            </FormLabel>
            <FormControl>
              <Input
                tabindex="5"
                type="tel"
                v-bind="componentField"
                :class="{ 'border-foreground': isFieldDirty('phone_number') }"
                @input="formatPhoneDisplay"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- jobTitle -->
      <div class="space-y-2">
        <FormField
          v-slot="{ componentField }"
          name="job_title"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem v-auto-animate>
            <FormLabel>
              {{ t('account.profile.form.jobTitle') }}
            </FormLabel>
            <FormControl>
              <Input
                tabindex="6"
                type="text"
                v-bind="componentField"
                :class="{ 'border-foreground': isFieldDirty('job_title') }"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </div>
    <span v-if="authStore.authError" class="text-destructive-foreground">{{
      authStore.authError
    }}</span>
    <Button :disabled="saveDisabled" type="submit">
      <Icon
        v-if="authStore.updatingProfile || saving"
        icon="svg-spinners:ring-resize"
      />
      <span v-else>Save Changes</span>
    </Button>
  </form>
</template>
