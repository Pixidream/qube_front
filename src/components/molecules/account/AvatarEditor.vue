<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Button } from '@components/atoms/button';
import { isTauri } from '@tauri-apps/api/core';
import { open as tauriOpen } from '@tauri-apps/plugin-dialog';
import { useFileDialog } from '@vueuse/core';
import { readFile } from '@tauri-apps/plugin-fs';
import { useAuthStore } from '@/stores/auth.stores';
import { platform } from '@tauri-apps/plugin-os';
import { Skeleton } from '@components/atoms/skeleton';
import { createComponentLogger } from '@/utils/logger';

// Create component-specific logger
const avatarEditorLogger = createComponentLogger('AvatarEditor');

const props = defineProps<{
  src: string;
  alt: string;
}>();

const { open: webOpen, onChange } = useFileDialog({
  accept: 'image/*',
  directory: false,
  multiple: false,
});
const authStore = useAuthStore();

onChange(async (files) => {
  const file = files?.item(0);

  if (!file) {
    avatarEditorLogger.warn('No file selected in web file dialog', {
      action: 'file_selection_cancelled',
      platform: 'web',
    });
    return;
  }

  avatarEditorLogger.info('Avatar file selected via web dialog', {
    action: 'avatar_file_selected',
    platform: 'web',
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  await authStore.updateProfile({
    profile_picture: file,
    id: authStore.user?.id,
    platform: 'web',
  });
});

const handleFileUploadWeb = () => {
  avatarEditorLogger.debug('Opening web file dialog for avatar upload', {
    action: 'open_file_dialog',
    platform: 'web',
  });
  webOpen();
};

const handleFileUploadTauri = async () => {
  avatarEditorLogger.debug('Opening Tauri file dialog for avatar upload', {
    action: 'open_file_dialog',
    platform: 'tauri',
  });

  const selection = await tauriOpen({
    multiple: false,
    directory: false,
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
  });

  if (!selection) {
    avatarEditorLogger.warn('No file selected in Tauri file dialog', {
      action: 'file_selection_cancelled',
      platform: 'tauri',
    });
    return;
  }

  const filePath = Array.isArray(selection) ? selection[0] : selection;

  avatarEditorLogger.info('Avatar file selected via Tauri dialog', {
    action: 'avatar_file_selected',
    platform: 'tauri',
    filePath: filePath.split(/[\\/]/).pop(), // Only log filename for privacy
  });

  try {
    const fileChunks = await readFile(filePath);

    const filename = filePath.split(/[\\/]/).pop() || 'upload';
    const ext = filename.split('.').pop()?.toLowerCase();
    const mime =
      ext === 'png' ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : 'application/octet-stream';

    const file = new File([fileChunks], filename, { type: mime });

    avatarEditorLogger.info('Avatar file processed successfully', {
      action: 'file_processed',
      platform: 'tauri',
      fileName: filename,
      fileSize: file.size,
      mimeType: mime,
    });

    await authStore.updateProfile({
      profile_picture: file,
      id: authStore.user?.id,
      platform: platform(),
    });
  } catch (error) {
    avatarEditorLogger.error('Failed to process avatar file', error as Error, {
      action: 'file_processing_failed',
      platform: 'tauri',
      filePath: filePath.split(/[\\/]/).pop(),
    });
  }
};

const handleFileUpload = () => {
  const platform = isTauri() ? 'tauri' : 'web';

  avatarEditorLogger.info('Avatar upload initiated', {
    action: 'avatar_upload_start',
    platform,
  });

  if (!isTauri()) return handleFileUploadWeb();
  handleFileUploadTauri();
};
</script>
<template>
  <div class="relative">
    <span
      class="relative flex size-8 shrink-0 overflow-hidden rounded-full h-24 w-24"
    >
      <Skeleton
        v-if="authStore.updatingProfile"
        class="h-full w-full object-cover object-center"
      />
      <img
        v-else
        :src="props.src"
        :alt="props.alt"
        class="h-full w-full object-cover object-center"
        decoding="async"
        loading="lazy"
      />
    </span>
    <Button
      class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9 absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
      :disabled="authStore.updatingProfile"
      @click="handleFileUpload"
    >
      <Icon
        v-if="authStore.updatingProfile"
        icon="svg-spinners:ring-resize"
        class="text-foreground"
      />
      <Icon v-else class="text-foreground" icon="lucide:camera" />
    </Button>
  </div>
</template>
