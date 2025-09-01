<script setup lang="ts">
// import { useI18n } from 'vue-i18n';
// import { useRoute, useRouter } from 'vue-router';
import ProfileCard from '@components/organisms/account/ProfileCard.vue';

// const route = useRoute();
// const router = useRouter();
// const { t } = useI18n();
// const routes: {
//   name: string;
//   display: string;
//   icon: string;
// }[] = [
//   {
//     name: 'profile',
//     display: t('navigation.profile'),
//     icon: 'lucide:user',
//   },
//   {
//     name: 'security',
//     display: t('navigation.security'),
//     icon: 'lucide:shield',
//   },
// ];
</script>
<template>
  <div class="container mx-auto space-y-6 px-4 py-10 md:max-w-4/5">
    <ProfileCard />
  </div>
</template>
