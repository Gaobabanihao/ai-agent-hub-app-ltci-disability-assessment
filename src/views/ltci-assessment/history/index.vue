<script setup lang="tsx">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElTag, ElButton } from 'element-plus';
import { PureTable } from '@/components/PureAdmin';
import type { TableColumns } from '@/components/PureAdmin';
import { useLtciAssessmentStore } from '@/store/modules/ltci-assessment';
import { useAssessment } from '../composables/useAssessment';
import type { AssessmentRecord, DisabilityLevel } from '../types';
import RecordDetail from './components/RecordDetail.vue';

defineOptions({ name: 'LtciAssessmentHistory' });

const router = useRouter();
const store = useLtciAssessmentStore();
const { restoreFromRecord } = useAssessment();

// ── Search form ──────────────────────────────────────────────────────────────
const searchForm = reactive({
  insureeName: '',
  disabilityLevel: '' as DisabilityLevel | '',
  dateRange: null as [string, string] | null,
});

const disabilityLevelOptions: { label: string; value: DisabilityLevel }[] = [
  { label: '轻度失能', value: '轻度失能' },
  { label: '中度失能', value: '中度失能' },
  { label: '重度失能', value: '重度失能' },
];

// ── Pagination ───────────────────────────────────────────────────────────────
const currentPage = ref(1);
const pageSize = ref(10);

// ── Detail drawer ────────────────────────────────────────────────────────────
const detailVisible = ref(false);
const detailRecord = ref<AssessmentRecord | null>(null);

// ── Data fetching ────────────────────────────────────────────────────────────
async function loadData() {
  await store.fetchList({
    page: currentPage.value,
    pageSize: pageSize.value,
    insureeName: searchForm.insureeName || undefined,
    disabilityLevel: searchForm.disabilityLevel || undefined,
    dateRange: searchForm.dateRange || undefined,
  });
}

function handleSearch() {
  currentPage.value = 1;
  loadData();
}

function handleReset() {
  searchForm.insureeName = '';
  searchForm.disabilityLevel = '';
  searchForm.dateRange = null;
  currentPage.value = 1;
  loadData();
}

// ── Actions ──────────────────────────────────────────────────────────────────
async function handleView(row: AssessmentRecord) {
  await store.fetchDetail(row.id);
  detailRecord.value = store.currentRecord;
  detailVisible.value = true;
}

function handleRestore(row: AssessmentRecord) {
  ElMessageBox.confirm(
    `确认恢复「${row.insureeName}」的评估记录？当前评估内容将被覆盖。`,
    '恢复评估',
    {
      confirmButtonText: '确认恢复',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    restoreFromRecord(row);
    router.push('/ltci-assessment');
    ElMessage.success('评估记录已恢复，文件需重新上传');
  }).catch(() => {});
}

async function handleDelete(row: AssessmentRecord) {
  try {
    await ElMessageBox.confirm(
      `确认删除「${row.insureeName}」的评估记录？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    );
    await store.removeRecord(row.id);
    ElMessage.success('删除成功');
  } catch {
    // user cancelled
  }
}

// ── Level tag ────────────────────────────────────────────────────────────────
function levelTagType(level: string) {
  if (level.includes('重度')) return 'danger';
  if (level === '中度失能') return 'danger';
  if (level === '轻度失能') return 'warning';
  return 'info';
}

function maskIdCard(idCard: string) {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 6) + '****' + idCard.slice(-4);
}

// ── Table columns ────────────────────────────────────────────────────────────
const columns: TableColumns[] = [
  { type: 'index', label: '序号', width: 60, align: 'center' },
  { label: '被保险人姓名', prop: 'insureeName', minWidth: 100 },
  {
    label: '身份证号',
    prop: 'idCard',
    minWidth: 160,
    cellRenderer: ({ row }) => <span>{maskIdCard((row as AssessmentRecord).idCard)}</span>,
  },
  { label: '评估日期', prop: 'assessmentDate', width: 120, align: 'center' },
  {
    label: '失能等级',
    prop: 'disabilityLevel',
    width: 110,
    align: 'center',
    cellRenderer: ({ row }) => {
      const r = row as AssessmentRecord;
      return (
        <ElTag
          type={levelTagType(r.disabilityLevel)}
          effect={r.disabilityLevel.includes('重度') ? 'dark' : 'light'}
        >
          {r.disabilityLevel}
        </ElTag>
      );
    },
  },
  { label: '评估项数', prop: 'gradedCount', width: 90, align: 'center' },
  {
    label: '提交时间',
      prop: 'submitTime',
      width: 170,
      align: 'center',
      cellRenderer: ({ row }) => {
        const r = row as AssessmentRecord;
        return <span>{new Date(r.submitTime || r.createdAt).toLocaleString('zh-CN')}</span>;
      },
    },
  {
    label: '操作',
    width: 200,
    align: 'center',
    fixed: 'right',
    cellRenderer: ({ row }) => {
      const r = row as AssessmentRecord;
      return (
        <div style="display:flex;gap:6px;justify-content:center;">
          <ElButton size="small" type="primary" plain onClick={() => handleView(r)}>查看</ElButton>
          <ElButton size="small" type="success" plain onClick={() => handleRestore(r)}>恢复</ElButton>
          <ElButton size="small" type="danger" plain onClick={() => handleDelete(r)}>删除</ElButton>
        </div>
      );
    },
  },
];

onMounted(loadData);
</script>

<template>
  <div class="history-page">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header__inner">
        <div class="page-header__left">
          <el-button plain size="small" @click="router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回评估
          </el-button>
          <div class="page-header__title">
            <el-icon><Tickets /></el-icon>
            <h1>历史评估记录</h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Search bar -->
    <div class="search-bar">
      <el-form inline>
        <el-form-item label="被保险人姓名">
          <el-input
            v-model="searchForm.insureeName"
            placeholder="输入姓名搜索"
            clearable
            style="width: 160px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="失能等级">
          <el-select
            v-model="searchForm.disabilityLevel"
            placeholder="全部"
            clearable
            style="width: 130px"
          >
            <el-option
              v-for="opt in disabilityLevelOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评估日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <PureTable
        :data="store.list"
        :columns="columns"
        :loading="store.loading"
        border
        stripe
        highlight-current-row
        :pagination="{
          total: store.total,
          pageSize,
          currentPage,
          background: true,
          align: 'right',
        }"
        @page-size-change="(val: number) => { pageSize = val; currentPage = 1; loadData(); }"
        @page-current-change="(val: number) => { currentPage = val; loadData(); }"
      />
    </div>

    <!-- Detail drawer -->
    <RecordDetail v-model="detailVisible" :record="detailRecord" />
  </div>
</template>

<style lang="scss" scoped>
.history-page {
  min-height: 100%;
  background: #f5f8fa;
  padding-bottom: 40px;
}

// ── Header ───────────────────────────────────────────────────────────────────

.page-header {
  background: linear-gradient(135deg, #1e6bb8 0%, #15589b 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 16px;

    .el-button {
      --el-button-text-color: rgba(255, 255, 255, 0.9);
      --el-button-border-color: rgba(255, 255, 255, 0.4);
      --el-button-bg-color: transparent;
      --el-button-hover-text-color: #fff;
      --el-button-hover-border-color: #fff;
      --el-button-hover-bg-color: rgba(255, 255, 255, 0.1);
    }
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;

    .el-icon {
      font-size: 20px;
    }

    h1 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
  }
}

// ── Search bar ───────────────────────────────────────────────────────────────

.search-bar {
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  :deep(.el-form--inline .el-form-item) {
    margin-bottom: 0;
    margin-right: 16px;
  }
}

// ── Table ────────────────────────────────────────────────────────────────────

.table-wrap {
  max-width: 1200px;
  margin: 16px auto 0;
  padding: 0 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  :deep(.pure-table-wrap) {
    padding: 16px 0;
  }
}
</style>
