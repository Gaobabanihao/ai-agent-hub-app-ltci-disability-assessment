<script setup lang="tsx">
import { ref } from 'vue';
import { PureDescriptions } from '../index';
import type { DescriptionsColumn } from '../descriptions/types';

defineOptions({
  name: 'PureDescriptionsDemo',
});

// 模拟用户详情数据
const userData = ref([
  {
    name: '张三',
    age: 28,
    gender: '男',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区某某街道123号',
    department: '技术部',
    position: '高级工程师',
    status: 'active',
    joinDate: '2020-03-15',
    salary: '25000',
  },
]);

const loading = ref(false);

// 描述列配置
const columns: DescriptionsColumn[] = [
  {
    label: '姓名',
    prop: 'name',
    span: 1,
    cellRenderer: ({ value }) => {
      return <span style="font-weight: 600; color: #409eff;">{value as string}</span>;
    },
  },
  {
    label: '年龄',
    prop: 'age',
    span: 1,
  },
  {
    label: '性别',
    prop: 'gender',
    span: 1,
  },
  {
    label: '联系电话',
    prop: 'phone',
    span: 2,
    copy: true, // 支持复制
  },
  {
    label: '邮箱地址',
    prop: 'email',
    span: 2,
    copy: true,
  },
  {
    label: '部门',
    prop: 'department',
    span: 1,
  },
  {
    label: '职位',
    prop: 'position',
    span: 1,
  },
  {
    label: '状态',
    prop: 'status',
    span: 1,
    cellRenderer: ({ value }) => {
      const status = value as string;
      return (
        <ElTag type={status === 'active' ? 'success' : 'info'}>
          {status === 'active' ? '在职' : '离职'}
        </ElTag>
      );
    },
  },
  {
    label: '入职日期',
    prop: 'joinDate',
    span: 1,
  },
  {
    label: '薪资',
    prop: 'salary',
    span: 1,
    cellRenderer: ({ value }) => {
      return <span style="color: #f56c6c; font-weight: 600;">¥{value}</span>;
    },
  },
  {
    label: '家庭住址',
    prop: 'address',
    span: 3,
  },
];
</script>

<template>
  <div class="pure-descriptions-demo">
    <h2>PureDescriptions 基础示例</h2>

    <PureDescriptions
      :data="userData"
      :columns="columns"
      :loading="{ load: loading }"
      title="员工详细信息"
      :column="3"
      border
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px; font-weight: 600;">员工详细信息</span>
          <ElTag type="success" size="small">VIP</ElTag>
        </div>
      </template>
      <template #extra>
        <el-button type="primary" size="small">编辑</el-button>
      </template>
    </PureDescriptions>

    <h2 style="margin-top: 40px;">PureDescriptions 简洁示例</h2>

    <PureDescriptions
      :data="userData"
      :columns="columns.slice(0, 6)"
      :loading="{ load: loading }"
      :column="2"
    />
  </div>
</template>

<style scoped lang="scss">
.pure-descriptions-demo {
  padding: 20px;

  h2 {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 600;
  }
}
</style>
