<script setup lang="tsx">
import { computed, ref } from 'vue';
import { Delete, Edit, Link, View, CopyDocument, Download } from '@element-plus/icons-vue';
import { AppContextMenu, useContextMenu } from '@/components/ContextMenu';
import type { MenuItem } from '@/components/ContextMenu';

defineOptions({ name: 'ContextMenuDemo' });

// ---- 场景一：列表右键 ----

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size: string;
}

const files: FileItem[] = [
  { name: '项目文档', type: 'folder', size: '-' },
  { name: '需求说明.docx', type: 'file', size: '128 KB' },
  { name: '设计稿.fig', type: 'file', size: '4.2 MB' },
  { name: '接口文档', type: 'folder', size: '-' },
  { name: '发布日志.md', type: 'file', size: '12 KB' },
];

const fileCtx = useContextMenu<FileItem>();

const fileMenuItems = computed((): MenuItem[] => {
  const row = fileCtx.row.value;
  if (!row) return [];
  return [
    { key: 'open', label: '打开', icon: View, onClick: () => ElMessage.success(`打开：${row.name}`) },
    { key: 'copy-link', label: '复制链接', icon: Link, onClick: () => ElMessage.success('已复制链接') },
    { key: 'download', label: '下载', icon: Download, disabled: row.type === 'folder', onClick: () => ElMessage.success(`下载：${row.name}`) },
    { key: 'rename', label: '重命名', icon: Edit, divided: true, onClick: () => ElMessage.info(`重命名：${row.name}`) },
    { key: 'delete', label: '删除', icon: Delete, onClick: () => ElMessage.error(`删除：${row.name}`) },
  ];
});

// ---- 场景二：表格行右键 ----

interface TableRow {
  id: number;
  name: string;
  status: '正常' | '禁用';
  role: string;
}

const tableData: TableRow[] = [
  { id: 1, name: '张三', status: '正常', role: '管理员' },
  { id: 2, name: '李四', status: '正常', role: '普通用户' },
  { id: 3, name: '王五', status: '禁用', role: '普通用户' },
  { id: 4, name: '赵六', status: '正常', role: '审核员' },
];

const tableCtx = useContextMenu<TableRow>();

const tableMenuItems = computed((): MenuItem[] => {
  const row = tableCtx.row.value;
  if (!row) return [];
  const isDisabled = row.status === '禁用';
  return [
    { key: 'view', label: '查看详情', icon: View, onClick: () => ElMessage.info(`查看：${row.name}`) },
    { key: 'edit', label: '编辑', icon: Edit, onClick: () => ElMessage.success(`编辑：${row.name}`) },
    { key: 'copy', label: '复制数据', icon: CopyDocument, divided: true, onClick: () => ElMessage.success('已复制') },
    {
      key: 'toggle-status',
      label: isDisabled ? '启用账号' : '禁用账号',
      icon: isDisabled ? View : Delete,
      divided: true,
      onClick: () => ElMessage.warning(`${isDisabled ? '启用' : '禁用'}：${row.name}`),
    },
    { key: 'delete', label: '删除', icon: Delete, onClick: () => ElMessage.error(`删除：${row.name}`) },
  ];
});

const tableColumns = ref([
  { label: 'ID', prop: 'id', width: 60 },
  { label: '姓名', prop: 'name' },
  { label: '状态', prop: 'status', cellRenderer: ({ row }: { row: TableRow }) => (
    <ElTag type={row.status === '正常' ? 'success' : 'danger'} size="small">{row.status}</ElTag>
  )},
  { label: '角色', prop: 'role' },
]);
</script>

<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>AppContextMenu 右键菜单</h1>
      <p>基于 Teleport + 边界检测封装，支持分割线、禁用项、动态菜单项</p>
    </div>

    <div class="demo-body">
      <!-- ---- 场景一：文件列表 ---- -->
      <section class="demo-section">
        <h3 class="section-title">场景一：列表右键</h3>
        <p class="section-desc">右键任意文件 / 文件夹，菜单项会根据类型动态调整（文件夹不能下载）</p>

        <div class="file-list">
          <div
            v-for="file in files"
            :key="file.name"
            class="file-item"
            @contextmenu="fileCtx.show(file, null, $event)"
          >
            <ElIcon class="file-item__icon" :color="file.type === 'folder' ? '#f59e0b' : '#6366f1'">
              <component :is="file.type === 'folder' ? 'Folder' : 'Document'" />
            </ElIcon>
            <span class="file-item__name">{{ file.name }}</span>
            <span class="file-item__size">{{ file.size }}</span>
          </div>
        </div>

        <AppContextMenu
          :visible="fileCtx.visible.value"
          :x="fileCtx.x.value"
          :y="fileCtx.y.value"
          :items="fileMenuItems"
          @close="fileCtx.close()"
        />
      </section>

      <ElDivider />

      <!-- ---- 场景二：表格行右键 ---- -->
      <section class="demo-section">
        <h3 class="section-title">场景二：表格行右键</h3>
        <p class="section-desc">
          右键表格行触发菜单。绑定方式：
          <code>@row-contextmenu="tableCtx.show"</code>
        </p>

        <ElTable
          :data="tableData"
          border
          style="width: 100%"
          row-class-name="ctx-table-row"
          @row-contextmenu="tableCtx.show"
        >
          <ElTableColumn
            v-for="col in tableColumns"
            :key="col.prop ?? col.label"
            v-bind="col"
          >
            <template v-if="col.cellRenderer" #default="scope">
              <component :is="col.cellRenderer(scope)" />
            </template>
          </ElTableColumn>
        </ElTable>

        <AppContextMenu
          :visible="tableCtx.visible.value"
          :x="tableCtx.x.value"
          :y="tableCtx.y.value"
          :items="tableMenuItems"
          @close="tableCtx.close()"
        />
      </section>

      <ElDivider />

      <!-- ---- 场景三：边界检测 ---- -->
      <section class="demo-section">
        <h3 class="section-title">场景三：边界检测</h3>
        <p class="section-desc">在页面边角右键，菜单会自动翻转方向，不超出视口</p>
        <div class="corner-grid">
          <div
            v-for="corner in ['左上角', '右上角', '左下角', '右下角']"
            :key="corner"
            class="corner-item"
            @contextmenu.prevent="(e) => files[0] && fileCtx.show(files[0], null, e)"
          >
            右键测试：{{ corner }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.demo-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.demo-header {
  padding: 36px 24px;
  text-align: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;

  h1 {
    margin: 0 0 8px;
    font-size: 26px;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 13px;
    opacity: 0.85;
  }
}

.demo-body {
  max-width: 800px;
  margin: 24px auto;
  padding: 0 24px 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%);
}

.demo-section {
  padding: 20px 0 4px;
}

.section-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-desc {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;

  code {
    padding: 1px 5px;
    background: var(--el-fill-color);
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
    color: var(--el-color-primary);
  }
}

// 文件列表
.file-list {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: default;
  transition: background-color 0.12s;
  user-select: none;

  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &__icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
    font-size: 13px;
    color: var(--el-text-color-primary);
  }

  &__size {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

// 边角测试
.corner-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.corner-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: var(--el-fill-color-light);
  border: 1px dashed var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  font-size: 13px;
  color: var(--el-text-color-secondary);
  cursor: default;
  user-select: none;
  transition: background-color 0.12s;

  &:hover {
    background-color: var(--el-fill-color);
  }
}
</style>

<style lang="scss">
// 表格行鼠标样式
.ctx-table-row {
  cursor: default;
  user-select: none;
}
</style>
