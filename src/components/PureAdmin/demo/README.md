# PureAdmin 组件库 Demo

这是 PureAdmin 组件库的使用示例，包含 PureTable 和 PureDescriptions 两个核心组件的演示。

## 组件说明

### PureTable

基于 Element Plus Table 封装的高级表格组件，提供以下特性：

- **列配置化**: 通过 columns 数组配置表格列
- **自定义渲染**: 支持 cellRenderer 和 headerRenderer 自定义单元格和表头渲染
- **分页支持**: 内置分页组件，自动处理分页逻辑
- **加载状态**: 支持 loading 状态和自定义加载配置
- **响应式**: 支持自适应高度和固定表头
- **国际化**: 支持多语言配置

#### 基础用法

```vue
<script setup lang="tsx">
import { PureTable } from '@/components/PureAdmin';
import type { TableColumns } from '@/components/PureAdmin';

const columns: TableColumns[] = [
  {
    label: '姓名',
    prop: 'name',
    minWidth: 120,
  },
  {
    label: '年龄',
    prop: 'age',
    width: 100,
  },
];

const tableData = [
  { name: '张三', age: 28 },
  { name: '李四', age: 32 },
];
</script>

<template>
  <PureTable
    :data="tableData"
    :columns="columns"
    border
    stripe
  />
</template>
```

#### 高级用法

```vue
<script setup lang="tsx">
import { ElTag } from 'element-plus';

const columns: TableColumns[] = [
  {
    label: '状态',
    prop: 'status',
    cellRenderer: ({ row }) => {
      return (
        <ElTag type={row.status === 'active' ? 'success' : 'info'}>
          {row.status === 'active' ? '激活' : '未激活'}
        </ElTag>
      );
    },
  },
];
</script>
```

### PureDescriptions

基于 Element Plus Descriptions 封装的描述列表组件，提供以下特性：

- **列配置化**: 通过 columns 数组配置描述项
- **自定义渲染**: 支持 cellRenderer 和 labelRenderer 自定义内容和标签渲染
- **复制功能**: 支持一键复制功能（copy: true）
- **加载状态**: 支持 loading 状态
- **插槽支持**: 支持 title 和 extra 插槽

#### 基础用法

```vue
<script setup lang="ts">
import { PureDescriptions } from '@/components/PureAdmin';
import type { DescriptionsColumn } from '@/components/PureAdmin';

const columns: DescriptionsColumn[] = [
  {
    label: '姓名',
    prop: 'name',
  },
  {
    label: '电话',
    prop: 'phone',
    copy: true, // 支持复制
  },
];

const data = [
  { name: '张三', phone: '13800138000' },
];
</script>

<template>
  <PureDescriptions
    :data="data"
    :columns="columns"
    :column="2"
    border
  />
</template>
```

## 如何使用

1. 将 demo 页面添加到路由中：

```typescript
// src/router/modules/demo.ts
{
  path: 'pure-admin-demo',
  name: 'PureAdminDemo',
  component: () => import('@/components/PureAdmin/demo/index.vue'),
  meta: {
    title: 'PureAdmin 示例',
    icon: 'Grid',
  },
}
```

2. 访问 `/pure-admin-demo` 路由查看示例

## 文件结构

```
demo/
├── index.vue                  # Demo 主入口
├── PureTableDemo.vue          # PureTable 示例
├── PureDescriptionsDemo.vue   # PureDescriptions 示例
└── README.md                  # 说明文档
```

## 参考资料

- [Element Plus Table](https://element-plus.org/zh-CN/component/table.html)
- [Element Plus Descriptions](https://element-plus.org/zh-CN/component/descriptions.html)
