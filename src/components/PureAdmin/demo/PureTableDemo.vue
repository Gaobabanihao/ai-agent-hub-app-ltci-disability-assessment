<script setup lang="tsx">
import { ref } from 'vue';
import { PureTable } from '../index';
import type { PureTableProps, TableColumns } from '../table/types';

defineOptions({
  name: 'PureTableDemo',
});

// 模拟数据
interface UserData {
  id: number;
  name: string;
  age: number;
  email: string;
  status: 'active' | 'inactive';
  createTime: string;
}

const tableData = ref<UserData[]>([
  {
    id: 1,
    name: '张三',
    age: 28,
    email: 'zhangsan@example.com',
    status: 'active',
    createTime: '2024-01-15',
  },
  {
    id: 2,
    name: '李四',
    age: 32,
    email: 'lisi@example.com',
    status: 'inactive',
    createTime: '2024-02-20',
  },
  {
    id: 3,
    name: '王五',
    age: 25,
    email: 'wangwu@example.com',
    status: 'active',
    createTime: '2024-03-10',
  },
  {
    id: 4,
    name: '赵六',
    age: 30,
    email: 'zhaoliu@example.com',
    status: 'active',
    createTime: '2024-04-05',
  },
  {
    id: 5,
    name: '孙七',
    age: 27,
    email: 'sunqi@example.com',
    status: 'inactive',
    createTime: '2024-05-12',
  },
]);

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(tableData.value.length);

// 表格列配置
const columns: TableColumns[] = [
  {
    type: 'selection',
    width: 55,
    align: 'center',
  },
  {
    label: 'ID',
    prop: 'id',
    width: 80,
    align: 'center',
  },
  {
    label: '姓名',
    prop: 'name',
    minWidth: 120,
    cellRenderer: ({ row }) => {
      const user = row as UserData;
      return <span style="font-weight: 600; color: #409eff;">{user.name}</span>;
    },
  },
  {
    label: '年龄',
    prop: 'age',
    width: 100,
    align: 'center',
  },
  {
    label: '邮箱',
    prop: 'email',
    minWidth: 200,
    showOverflowTooltip: true,
  },
  {
    label: '状态',
    prop: 'status',
    width: 120,
    align: 'center',
    cellRenderer: ({ row }) => {
      const user = row as UserData;
      return (
        <ElTag type={user.status === 'active' ? 'success' : 'info'}>
          {user.status === 'active' ? '激活' : '未激活'}
        </ElTag>
      );
    },
  },
  {
    label: '创建时间',
    prop: 'createTime',
    width: 150,
    align: 'center',
  },
  {
    label: '操作',
    width: 200,
    align: 'center',
    cellRenderer: ({ row }) => {
      const user = row as UserData;
      return (
        <div style="display: flex; gap: 8px; justify-content: center;">
          <ElButton size="small" type="primary" onClick={() => handleEdit(user)}>
            编辑
          </ElButton>
          <ElButton size="small" type="danger" onClick={() => handleDelete(user)}>
            删除
          </ElButton>
        </div>
      );
    },
  },
];

const handleEdit = (row: UserData) => {
  console.log('编辑:', row);
};

const handleDelete = (row: UserData) => {
  console.log('删除:', row);
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  console.log('每页条数:', val);
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  console.log('当前页:', val);
};

const tableProps: PureTableProps = {
  data: tableData.value,
  columns,
  loading: loading.value,
  border: true,
  stripe: true,
  highlightCurrentRow: true,
  pagination: {
    total: total.value,
    pageSize: pageSize.value,
    currentPage: currentPage.value,
    background: true,
    align: 'right',
  },
};
</script>

<template>
  <div class="pure-table-demo">
    <h2>PureTable 基础示例</h2>
    <PureTable
      v-bind="tableProps"
      @page-size-change="handleSizeChange"
      @page-current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped lang="scss">
.pure-table-demo {
  padding: 20px;

  h2 {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 600;
  }
}
</style>
