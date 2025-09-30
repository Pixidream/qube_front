<script setup lang="ts">
import type { ProgressRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ProgressIndicator, ProgressRoot } from 'reka-ui';
import { cn } from '@utils/tailwindMerge';

const props = withDefaults(
  defineProps<
    ProgressRootProps & {
      class?: HTMLAttributes['class'];
      indeterminate?: boolean;
    }
  >(),
  {
    modelValue: 0,
    indeterminate: false,
  },
);

const delegatedProps = reactiveOmit(props, 'class', 'indeterminate');
</script>

<template>
  <ProgressRoot
    v-bind="delegatedProps"
    :class="
      cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
        props.class,
      )
    "
  >
    <ProgressIndicator
      v-if="!props.indeterminate"
      class="h-full w-full flex-1 bg-primary transition-transform transform-gpu duration-300 [transition-timing-function:cubic-bezier(.22,1,.36,1)] will-change-transform"
      :style="`transform: translateX(-${100 - (props.modelValue ?? 0)}%);`"
    />
    <ProgressIndicator
      v-else
      class="h-full w-1/3 flex-1 rounded-full bg-primary/80 animate-progress-indeterminate"
    />
  </ProgressRoot>
</template>
