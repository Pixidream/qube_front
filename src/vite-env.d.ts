/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  /* eslint-disable @typescript-eslint/no-empty-object-type  */
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
