<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElDescriptions, ElDescriptionsItem, ElTag, ElCollapse, ElCollapseItem } from 'element-plus';
import type { AssessmentRecord } from '../../types';
import {
  getAssessmentDetail,
  getAssessmentFiles,
  type AssessmentDetailResult,
  type UploadedFile,
} from '@/api/ltci-assessment';

defineOptions({ name: 'RecordDetail' });

const props = defineProps<{
  modelValue: boolean;
  record: AssessmentRecord | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const detailLoading = ref(false);
const officialDetail = ref<AssessmentDetailResult | null>(null);
const officialFiles = ref<UploadedFile[] | null>(null);

const CATEGORY_LABEL_MAP: Record<number, string> = {
  1: '日常生活活动能力评估',
  2: '认知能力评估',
  3: '情绪与精神状态评估',
  4: '感知觉与沟通评估',
};

const levelTagType = computed(() => {
  const level = officialDetail.value?.assessment.finalGrade || props.record?.disabilityLevel || '';
  if (level.includes('重度')) {
    return 'danger';
  }
  switch (level) {
    case '轻度失能': return 'warning';
    case '中度失能': return 'danger';
    default: return 'info';
  }
});

const displayScore = computed(() => officialDetail.value?.assessment.finalScore ?? props.record?.avgGrade ?? 0);
const displayGrade = computed(() => officialDetail.value?.assessment.finalGrade ?? props.record?.disabilityLevel ?? '未完成评估');
const displayItemCount = computed(() => officialDetail.value?.assessment.itemCount ?? props.record?.gradedCount ?? 0);

const displayFiles = computed(() => {
  if (officialFiles.value) {
    return {
      selfAssessment: officialFiles.value.filter((file) => file.fileType === 1),
      medical: officialFiles.value.filter((file) => file.fileType === 2),
      video: officialFiles.value.filter((file) => file.fileType === 3),
    };
  }

  return {
    selfAssessment: props.record?.filesInfo.selfAssessment || [],
    medical: props.record?.filesInfo.medical || [],
    video: props.record?.filesInfo.video || [],
  };
});

// Group assessment items by category
const groupedItems = computed(() => {
  if (officialDetail.value) {
    const map = new Map<string, Array<{ key: string | number; name: string; grade: number | string; note?: string }>>();
    for (const item of officialDetail.value.items) {
      const categoryName = CATEGORY_LABEL_MAP[item.category] || `类别 ${item.category}`;
      if (!map.has(categoryName)) map.set(categoryName, []);
      map.get(categoryName)!.push({
        key: item.id,
        name: item.itemName,
        grade: item.grade,
        note: item.assessmentNote,
      });
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }

  if (!props.record) return [];
  const map = new Map<string, Array<{ key: string | number; name: string; grade: number | string; note?: string }>>();
  for (const item of props.record.assessmentItems) {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category)!.push({
      key: item.itemId,
      name: item.item,
      grade: item.grade || '',
      note: item.note,
    });
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
});

function maskIdCard(idCard: string) {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 6) + '********' + idCard.slice(-4);
}

function handlePrint() {
  window.print();
}

function handleExport() {
  // PDF export placeholder
  import('element-plus').then(({ ElMessage }) => {
    ElMessage.info('PDF 导出功能开发中，敬请期待');
  });
}

async function loadOfficialDetail() {
  if (!props.record?.assessmentId) {
    officialDetail.value = null;
    officialFiles.value = null;
    return;
  }

  detailLoading.value = true;
  try {
    const [detail, files] = await Promise.all([
      getAssessmentDetail(props.record.assessmentId),
      getAssessmentFiles(props.record.assessmentId),
    ]);
    officialDetail.value = detail;
    officialFiles.value = files;
  } catch {
    officialDetail.value = null;
    officialFiles.value = null;
  } finally {
    detailLoading.value = false;
  }
}

watch(
  () => [visible.value, props.record?.assessmentId] as const,
  ([isVisible]) => {
    if (!isVisible) {
      return;
    }
    loadOfficialDetail();
  },
  { immediate: true },
);
</script>

<template>
  <el-drawer
    v-model="visible"
    title="评估详情"
    size="600px"
    direction="rtl"
    destroy-on-close
  >
    <div v-if="record" v-loading="detailLoading" class="detail-body">
      <!-- Section 1: Basic info -->
      <div class="detail-section">
        <div class="detail-section__title">被保险人信息</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="姓名">{{ record.insureeName }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ maskIdCard(record.idCard) }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ record.phone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="参保地区">{{ record.insuranceArea || '—' }}</el-descriptions-item>
          <el-descriptions-item label="评估日期">{{ record.assessmentDate }}</el-descriptions-item>
          <el-descriptions-item label="评估人员">{{ record.assessor }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Section 2: Result banner -->
      <div class="detail-section">
        <div class="detail-section__title">评估结论</div>
        <div class="grade-banner" v-if="displayItemCount > 0">
          <div class="grade-banner__item">
            <span class="grade-banner__value">{{ displayItemCount }}</span>
            <span class="grade-banner__label">已评估项目</span>
          </div>
          <div class="grade-banner__divider" />
          <div class="grade-banner__item">
            <span class="grade-banner__value">{{ displayScore.toFixed(1) }}</span>
            <span class="grade-banner__label">综合得分</span>
          </div>
          <div class="grade-banner__divider" />
          <div class="grade-banner__item">
            <el-tag :type="levelTagType" size="large" effect="dark">
              {{ displayGrade }}
            </el-tag>
            <span class="grade-banner__label">失能等级</span>
          </div>
        </div>
        <div v-else class="grade-banner--empty">暂无评估数据</div>
      </div>

      <!-- Section 3: Assessment items by category -->
      <div class="detail-section">
        <div class="detail-section__title">各维度评估结果</div>
        <el-collapse accordion>
          <el-collapse-item
            v-for="group in groupedItems"
            :key="group.category"
            :title="group.category"
            :name="group.category"
          >
            <div
              v-for="item in group.items"
              :key="item.key"
              class="assess-item-row"
            >
              <span class="assess-item-row__name">{{ item.name }}</span>
              <el-tag size="small" type="info">{{ item.grade }} 级</el-tag>
              <span v-if="item.note" class="assess-item-row__note">{{ item.note }}</span>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- Section 4: File list -->
      <div class="detail-section">
        <div class="detail-section__title">上传材料</div>
        <div
          v-if="
            displayFiles.selfAssessment.length === 0 &&
            displayFiles.medical.length === 0 &&
            displayFiles.video.length === 0
          "
          class="file-empty"
        >
          暂无上传文件
        </div>
        <template v-else>
          <div v-if="displayFiles.selfAssessment.length > 0" class="file-group">
            <div class="file-group__label">自评表</div>
            <div v-for="f in displayFiles.selfAssessment" :key="f.id" class="file-row">
              <el-icon><Document /></el-icon>
              <span class="file-row__name">{{ 'fileName' in f ? f.fileName : f.name }}</span>
              <span class="file-row__meta">
                {{ 'fileSize' in f ? `${(f.fileSize / 1024 / 1024).toFixed(2)} MB` : f.size }}
                ·
                {{ 'uploadedAt' in f ? new Date(f.uploadedAt).toLocaleString('zh-CN') : f.time }}
              </span>
            </div>
          </div>
          <div v-if="displayFiles.medical.length > 0" class="file-group">
            <div class="file-group__label">医疗材料</div>
            <div v-for="f in displayFiles.medical" :key="f.id" class="file-row">
              <el-icon><Document /></el-icon>
              <span class="file-row__name">{{ 'fileName' in f ? f.fileName : f.name }}</span>
              <span class="file-row__meta">
                {{ 'fileSize' in f ? `${(f.fileSize / 1024 / 1024).toFixed(2)} MB` : f.size }}
                ·
                {{ 'uploadedAt' in f ? new Date(f.uploadedAt).toLocaleString('zh-CN') : f.time }}
              </span>
            </div>
          </div>
          <div v-if="displayFiles.video.length > 0" class="file-group">
            <div class="file-group__label">音视频材料</div>
            <div v-for="f in displayFiles.video" :key="f.id" class="file-row">
              <el-icon><VideoCamera /></el-icon>
              <span class="file-row__name">{{ 'fileName' in f ? f.fileName : f.name }}</span>
              <span class="file-row__meta">
                {{ 'fileSize' in f ? `${(f.fileSize / 1024 / 1024).toFixed(2)} MB` : f.size }}
                ·
                {{ 'uploadedAt' in f ? new Date(f.uploadedAt).toLocaleString('zh-CN') : f.time }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Footer actions -->
    <template #footer>
      <div class="detail-footer">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出 PDF
        </el-button>
        <el-button type="primary" @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印报告
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
.detail-body {
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #1e6bb8;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #e8f4fc;
  }
}

// ── Grade banner (reuse Step4 style) ────────────────────────────────────────

.grade-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8faff;
  border-radius: 8px;
  border: 1px solid #e8f4fc;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
    text-align: center;
  }

  &__value {
    font-size: 24px;
    font-weight: 700;
    color: #1e6bb8;
    line-height: 1;
  }

  &__label {
    font-size: 12px;
    color: #999;
  }

  &__divider {
    width: 1px;
    height: 36px;
    background: #e8f4fc;
    flex-shrink: 0;
  }

  &--empty {
    text-align: center;
    color: #999;
    font-size: 13px;
    padding: 16px;
    background: #f8faff;
    border-radius: 8px;
  }
}

// ── Assessment item rows ─────────────────────────────────────────────────────

.assess-item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &__name {
    flex: 1;
    font-size: 13px;
    color: #333;
  }

  &__note {
    font-size: 12px;
    color: #999;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ── File list ────────────────────────────────────────────────────────────────

.file-empty {
  font-size: 13px;
  color: #999;
  padding: 12px;
  text-align: center;
  background: #fafafa;
  border-radius: 6px;
}

.file-group {
  margin-bottom: 12px;

  &__label {
    font-size: 12px;
    color: #666;
    font-weight: 600;
    margin-bottom: 6px;
  }
}

.file-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 13px;

  .el-icon {
    color: #1e6bb8;
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333;
  }

  &__meta {
    font-size: 11px;
    color: #aaa;
    flex-shrink: 0;
  }
}

// ── Footer ───────────────────────────────────────────────────────────────────

.detail-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media print {
  .detail-footer {
    display: none;
  }
}
</style>
