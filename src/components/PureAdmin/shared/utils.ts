import { useClipboard, useDark } from '@vueuse/core';
import { debounce as lodashDebounce } from 'lodash-es';
import { ref, type Ref } from 'vue';

export const isFunction = (
  value: unknown,
): value is (...args: unknown[]) => unknown => typeof value === 'function';

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean';

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isArray = Array.isArray as (value: unknown) => value is unknown[];

export const debounce = lodashDebounce;

export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => window.setTimeout(resolve, ms));

export function useCopyToClipboard(): {
  copied: Ref<boolean>;
  update: (value: string) => Promise<void>;
} {
  const copied = ref(false);
  const { copy } = useClipboard();

  const update = async (value: string) => {
    await copy(value);
    copied.value = true;
  };

  return { copied, update };
}

export { useDark };
