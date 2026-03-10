/**
 * 枚举项类型
 */
export interface EnumItem {
  label: string;
  value: string;
  type?: 'success' | 'info' | 'warning' | 'danger' | 'primary';
  [key: string]: any;
}

/**
 * 枚举对象类型
 */
export type EnumObject = Record<string, EnumItem>;

/**
 * 提取枚举值类型
 */
export type EnumValue<T extends EnumObject> = T[keyof T]['value'];

/**
 * 提取枚举标签类型
 */
export type EnumLabel<T extends EnumObject> = T[keyof T]['label'];

/**
 * 枚举选项类型
 */
export interface EnumOption<T = string> {
  label: string;
  value: T;
}

/**
 * 根据值获取枚举项
 */
export function getEnumItem<T extends EnumObject>(enumObj: T, value: string): T[keyof T] | undefined {
  return Object.values(enumObj).find(item => item.value === value) as T[keyof T] | undefined;
}

/**
 * 根据值获取标签
 */
export function getEnumLabel<T extends EnumObject>(enumObj: T, value: string): string {
  const item = getEnumItem(enumObj, value);
  return item?.label ?? value;
}

/**
 * 根据值获取类型
 */
export function getEnumType<T extends EnumObject>(enumObj: T, value: string): EnumItem['type'] {
  const item = getEnumItem(enumObj, value);
  return item?.type;
}

/**
 * 检查值是否存在
 */
export function hasEnumValue<T extends EnumObject>(enumObj: T, value: string): boolean {
  return Object.values(enumObj).some(item => item.value === value);
}

/**
 * 创建枚举选项数组
 */
export function createEnumOptions<T extends EnumObject>(enumObj: T): EnumOption<EnumValue<T>>[] {
  return Object.values(enumObj).map(item => ({
    label: item.label,
    value: item.value as EnumValue<T>,
  }));
}
