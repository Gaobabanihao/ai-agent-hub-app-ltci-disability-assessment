import { ref, reactive, toRaw } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { cloneDeep } from 'lodash-es';

export interface UseFormOptions<T extends Record<string, unknown>> {
  /** 表单初始值 */
  initialValues: T;
  /** 表单验证规则 */
  rules?: FormRules;
}

/**
 * 表单状态管理 Hook
 *
 * 封装表单常用逻辑：初始化、验证、重置、提交
 *
 * @example
 * ```ts
 * const { formRef, form, rules, validate, reset, setValues, getValues } = useForm({
 *   initialValues: { username: '', password: '' },
 *   rules: {
 *     username: [{ required: true, message: '请输入用户名' }],
 *     password: [{ required: true, message: '请输入密码' }],
 *   },
 * });
 *
 * // 验证表单
 * const valid = await validate();
 *
 * // 重置表单
 * reset();
 *
 * // 设置表单值
 * setValues({ username: 'admin' });
 *
 * // 获取表单值
 * const values = getValues();
 * ```
 */
export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>) {
  const { initialValues, rules = {} } = options;

  const formRef = ref<FormInstance>();
  const form = reactive<T>(cloneDeep(initialValues));
  const initialFormValues = cloneDeep(initialValues);

  /** 验证表单 */
  async function validate(): Promise<boolean> {
    if (!formRef.value) return false;
    try {
      await formRef.value.validate();
      return true;
    } catch {
      return false;
    }
  }

  /** 验证指定字段 */
  async function validateField(field: keyof T | (keyof T)[]): Promise<boolean> {
    if (!formRef.value) return false;
    try {
      await formRef.value.validateField(field as string | string[]);
      return true;
    } catch {
      return false;
    }
  }

  /** 清除验证状态 */
  function clearValidate(field?: keyof T | (keyof T)[]) {
    formRef.value?.clearValidate(field as string | string[]);
  }

  /** 重置表单到初始值 */
  function reset() {
    Object.keys(initialFormValues).forEach((key) => {
      (form as Record<string, unknown>)[key] = cloneDeep(
        (initialFormValues as Record<string, unknown>)[key]
      );
    });
    clearValidate();
  }

  /** 重置指定字段 */
  function resetField(field: keyof T | (keyof T)[]) {
    const fields = Array.isArray(field) ? field : [field];
    fields.forEach((f) => {
      (form as Record<string, unknown>)[f as string] = cloneDeep(
        (initialFormValues as Record<string, unknown>)[f as string]
      );
    });
    clearValidate(field);
  }

  /** 设置表单值 */
  function setValues(values: Partial<T>) {
    Object.keys(values).forEach((key) => {
      if (key in form) {
        (form as Record<string, unknown>)[key] = values[key as keyof T];
      }
    });
  }

  /** 获取表单值（原始对象） */
  function getValues(): T {
    return toRaw(form) as T;
  }

  /** 获取指定字段值 */
  function getValue<K extends keyof T>(field: K): T[K] {
    return (form as T)[field];
  }

  /** 设置指定字段值 */
  function setValue<K extends keyof T>(field: K, value: T[K]) {
    (form as Record<string, unknown>)[field as string] = value;
  }

  return {
    /** 表单实例引用 */
    formRef,
    /** 表单数据 */
    form,
    /** 验证规则 */
    rules,
    /** 验证表单 */
    validate,
    /** 验证指定字段 */
    validateField,
    /** 清除验证状态 */
    clearValidate,
    /** 重置表单 */
    reset,
    /** 重置指定字段 */
    resetField,
    /** 设置表单值 */
    setValues,
    /** 获取表单值 */
    getValues,
    /** 获取指定字段值 */
    getValue,
    /** 设置指定字段值 */
    setValue,
  };
}
