import { ref } from 'vue';

/**
 * 布尔状态管理 Hook
 *
 * @param initialValue 初始值，默认 false
 *
 * @example
 * ```ts
 * const { value: visible, setTrue: open, setFalse: close, toggle } = useBoolean();
 *
 * open();   // visible = true
 * close();  // visible = false
 * toggle(); // visible = !visible
 * ```
 */
export function useBoolean(initialValue = false) {
  const value = ref(initialValue);

  function setTrue() {
    value.value = true;
  }

  function setFalse() {
    value.value = false;
  }

  function toggle() {
    value.value = !value.value;
  }

  function setValue(val: boolean) {
    value.value = val;
  }

  return {
    value,
    setTrue,
    setFalse,
    toggle,
    setValue,
  };
}
