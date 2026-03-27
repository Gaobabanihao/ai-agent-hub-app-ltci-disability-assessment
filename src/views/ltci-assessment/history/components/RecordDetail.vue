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
const aiContent = computed(() => {
  const content = officialDetail.value?.content;
  return content ? content : null;
});
// 解析医疗材料AI建议数据

const smartAssessSummary = computed(() => {
  const summary = aiContent.value?.smartAssessSummary;
  if (!summary) return null;
  try {
    return JSON.parse(summary);
  } catch {
    return summary;
  }
});

const preAssessTip = computed(() => {
  const tip = aiContent.value?.preAssessTip;
  if (!tip) return null;
  try {
    return JSON.parse(tip);
  } catch {
    return tip;
  }
});

const keySuggest = computed(() => {
  const suggest = aiContent.value?.keySuggest;
  if (!suggest) return null;
  try {
    return JSON.parse(suggest);
  } catch {
    return suggest;
  }
});

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
      <!-- <div class="detail-section">
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
      </div> -->

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

      <!-- Section 4: 自评表结果 -->
      <div class="detail-section">
        <div class="detail-section__title">自评表结果</div>
        <div v-if="officialDetail?.structExtract" class="ai-result">
            <div class="self-assessment-content">
              <div v-if="JSON.parse(officialDetail?.structExtract)['自评表结果']" class="self-assessment-result">
                <div v-if="JSON.parse(officialDetail?.structExtract)['自评表结果']['ADL自评']" class="self-assessment-section">
                  <h5 class="self-assessment-section__title">ADL自评</h5>
                  <div class="self-assessment-section__content">
                    <div v-for="(item, index) in JSON.parse(officialDetail?.structExtract)['自评表结果']['ADL自评']" :key="index"
                      class="self-assessment-item">
                      <span class="self-assessment-item__label">{{ item.项目 }}：</span>
                      <span class="self-assessment-item__value">{{ item.自评结果 }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="JSON.parse(officialDetail?.structExtract)['自评表结果']['自评失能等级']" class="self-assessment-section">
                  <h5 class="self-assessment-section__title">自评失能等级</h5>
                  <div class="self-assessment-section__content">
                    <span class="self-assessment-grade">{{ JSON.parse(officialDetail?.structExtract)['自评表结果']['自评失能等级'] }}</span>
                  </div>
                </div>
              </div>
            </div>
        
        </div>
        <div v-else class="file-empty">
          暂无自评表结果
        </div>
      </div>

      <!-- Section 5: 医疗材料结果 -->
      <div class="detail-section">
        <div class="detail-section__title">医疗材料结果</div>
        <div v-if="officialDetail?.content" class="ai-result">
       <div v-if="officialDetail?.content">
          <div class="ai-section">
            <h4 class="ai-section__title">
              <el-icon>
                <Document />
              </el-icon>
              智能评估结果摘要
            </h4>
            <div v-if="smartAssessSummary" class="ai-section__content">
              <div v-if="smartAssessSummary['智能评估失能等级建议']" class="ai-item">
                <div class="ai-item__label">失能等级建议：</div>
                <div class="ai-item__value">{{ smartAssessSummary['智能评估失能等级建议'].区间 }}</div>
                <div class="ai-item__desc">{{ smartAssessSummary['智能评估失能等级建议'].依据 }}</div>
              </div>
              <div v-if="smartAssessSummary['置信度提示']" class="ai-item">
                <div class="ai-item__label">置信度：</div>
                <div class="ai-item__value">{{ smartAssessSummary['置信度提示'].置信度 }}</div>
                <div class="ai-item__desc">{{ smartAssessSummary['置信度提示'].置信度依据 }}</div>
              </div>
              <div v-if="smartAssessSummary['ADL雷达']" class="ai-item">
                <div class="ai-item__label">ADL评估：</div>
                <div class="ai-item__list">
                  <div v-for="(item, index) in smartAssessSummary['ADL雷达']" :key="index" class="ai-item__list-item">
                    <span class="ai-item__list-label">{{ item.项目 }}：</span>
                    <span class="ai-item__list-value">{{ item.评估 }}</span>
                    <span class="ai-item__list-desc">{{ item.依据 }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="ai-section__empty">
              暂无智能评估结果摘要
            </div>
          </div>

          <!-- 系统预评估提示 -->
          <div class="ai-section">
            <h4 class="ai-section__title">
              <el-icon>
                <Warning />
              </el-icon>
              系统预评估提示
            </h4>
            <div v-if="preAssessTip" class="ai-section__content">
              <div v-if="preAssessTip['重点评估关注事项']" class="ai-item">
                <div class="ai-item__label">重点评估关注事项：</div>
                <div class="ai-item__list">
                  <div v-for="(item, index) in preAssessTip['重点评估关注事项']" :key="index" class="ai-item__list-item">
                    <span class="ai-item__list-label">{{ item.事项 }}</span>
                    <span class="ai-item__list-desc">{{ item.依据 }}</span>
                  </div>
                </div>
              </div>
              <div v-if="preAssessTip['高风险标记'] && preAssessTip['高风险标记'].length > 0" class="ai-item">
                <div class="ai-item__label">高风险标记：</div>
                <div class="ai-item__list">
                  <div v-for="(item, index) in preAssessTip['高风险标记']" :key="index" class="ai-item__list-item">
                    <span class="ai-item__list-label">{{ item }}</span>
                  </div>
                </div>
              </div>
              <div v-if="preAssessTip['主要致失能推断原因'] && preAssessTip['主要致失能推断原因'].length > 0" class="ai-item">
                <div class="ai-item__label">主要致失能推断原因：</div>
                <div class="ai-item__list">
                  <div v-for="(item, index) in preAssessTip['主要致失能推断原因']" :key="index" class="ai-item__list-item">
                    <span class="ai-item__list-label">{{ item }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="ai-section__empty">
              暂无系统预评估提示
            </div>
          </div>

          <!-- 重点建议 -->
          <div class="ai-section">
            <h4 class="ai-section__title">
              <el-icon>
                <Lightning />
              </el-icon>
              重点建议
            </h4>
            <div v-if="keySuggest" class="ai-section__content">
              <div v-if="keySuggest['建议重点核实的能力项']" class="ai-item">
                <div class="ai-item__label">建议重点核实的能力项：</div>
                <div class="ai-item__list">
                  <div v-for="(item, index) in keySuggest['建议重点核实的能力项']" :key="index" class="ai-item__list-item">
                    <span class="ai-item__list-label">{{ item.能力项 }}</span>
                    <span class="ai-item__list-desc">{{ item.依据 }}</span>
                  </div>
                </div>
              </div>
              <div v-if="keySuggest['个性化重点提问清单']" class="ai-item">
                <div class="ai-item__label">个性化重点提问清单：</div>
                <div class="ai-item__list">
                  <div v-for="(item, index) in keySuggest['个性化重点提问清单']" :key="index" class="ai-item__list-item">
                    <span class="ai-item__list-label">{{ item.问题 }}</span>
                    <span class="ai-item__list-desc">{{ item.依据 }}</span>
                  </div>
                </div>
              </div>
              <div v-if="keySuggest['建议现场/视频重点观察动作']" class="ai-item">
                <div class="ai-item__label">建议现场/视频重点观察动作：</div>
                <div class="ai-item__list">
                  <div v-for="(item, index) in keySuggest['建议现场/视频重点观察动作']" :key="index" class="ai-item__list-item">
                    <span class="ai-item__list-label">{{ item.观察动作 }}</span>
                    <span class="ai-item__list-desc">{{ item.依据 }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="ai-section__empty">
              暂无重点建议
            </div>
          </div>
        </div>
        </div>
        <div v-else class="file-empty">
          暂无医疗材料结果
        </div>
      </div>

      <!-- Section 6: 音视频结果 -->
      <div class="detail-section">
        <div class="detail-section__title">音视频结果</div>
        <div v-if="officialDetail?.inProcess" class="ai-result">
            <div style="display: flex; flex-direction: column; gap: 40px">
                  <div
                    v-for="(item, index) in JSON.parse(officialDetail?.inProcess)"
                    :key="index"
                    style="display: flex; flex-direction: column"
                  >
                    <div
                      style="
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                        font-size: 13px;
                        color: #000;
                        padding: 16px;
                        border: 1px dashed #d8e6f2;
                        border-radius: 6px;
                      "
                    >
                      <div>涉及项目:{{ item.涉及项目 }}</div>
                      <div>类型:{{ item.类型 }}</div>
                      <div>提示内容:{{ item.提示内容 }}</div>
                      <div>依据:{{ item.依据 }}</div>
                    </div>
                  </div>
                </div>
        </div>
        <div v-else class="file-empty">
          暂无音视频结果
        </div>
      </div>

      <!-- Section 7: File list -->
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

// ── AI Result ────────────────────────────────────────────────────────────────

.ai-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-section {
  background: #f8fafc;
  border: 1px solid #e8f4fc;
  border-radius: 8px;
  overflow: hidden;
}

.ai-section__content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.ai-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &__row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #444;
  }

  &__value {
    font-size: 13px;
    color: #333;
    margin-left: 12px;
  }

  &__content {
    font-size: 13px;
    color: #333;
    line-height: 1.5;
  }

  &__subrow {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-left: 12px;
    margin-top: 4px;
  }

  &__sublabel {
    font-size: 12px;
    font-weight: 500;
    color: #666;
  }

  &__subvalue {
    font-size: 12px;
    color: #333;
    margin-left: 12px;
  }

  &__subsubrow {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-left: 12px;
    margin-top: 2px;
  }

  &__subsublabel {
    font-size: 11px;
    font-weight: 500;
    color: #888;
  }

  &__subsubvalue {
    font-size: 11px;
    color: #333;
    margin-left: 12px;
  }

  &__array-item {
    font-size: 12px;
    color: #333;
    margin-left: 12px;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}.self-assessment-content {
  font-size: 13px;
  color: #444;
  line-height: 1.6;

  /* 确保HTML内容中的元素能够正确渲染 */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: 14px;
    font-weight: 600;
    color: #1e6bb8;
    margin-top: 12px;
    margin-bottom: 8px;
  }

  p {
    margin-bottom: 8px;
  }

  ul,
  ol {
    margin-left: 20px;
    margin-bottom: 8px;
  }

  li {
    margin-bottom: 4px;
  }
}

.self-assessment-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.self-assessment-section {
  background: #fff;
  border: 1px solid #e8f4fc;
  border-radius: 6px;
  padding: 12px;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #1e6bb8;
    margin: 0 0 12px 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.self-assessment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e8f4fc;
  border-radius: 4px;

  &__label {
    font-size: 13px;
    color: #444;
    font-weight: 500;
  }

  &__value {
    font-size: 13px;
    color: #1e6bb8;
    font-weight: 600;
  }
}

.self-assessment-grade {
  font-size: 16px;
  font-weight: 600;
  color: #1e6bb8;
  padding: 8px 12px;
  background: #f0f7ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  display: inline-block;
}

.self-assessment-content {
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
  }

  th,
  td {
    border: 1px solid #e8f4fc;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f8fafc;
    font-weight: 600;
  }
}
.ai-section {
  background: #f8fafc;
  border: 1px solid #e8f4fc;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #1e6bb8;
    padding: 12px 16px;
    background: #e8f4fc;
    margin: 0;
  }

  &__content {
    padding: 16px;
    max-height: 300px;
    overflow-y: auto;
  }

  &__empty {
    padding: 24px 16px;
    text-align: center;
    color: #999;
    font-size: 13px;
  }

  &__loading {
    padding: 24px 16px;
    text-align: center;
    color: #1e6bb8;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
}

// ── AI Item ─────────────────────────────────────────────────────────────────

.ai-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #444;
    margin-bottom: 8px;
  }

  &__value {
    font-size: 13px;
    color: #1e6bb8;
    font-weight: 500;
    margin-bottom: 4px;
  }

  &__desc {
    font-size: 12px;
    color: #666;
    line-height: 1.5;
    margin-bottom: 8px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__list-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px;
    background: #fff;
    border: 1px solid #e8f4fc;
    border-radius: 6px;
  }

  &__list-label {
    font-size: 13px;
    font-weight: 500;
    color: #444;
  }

  &__list-value {
    font-size: 13px;
    color: #1e6bb8;
    font-weight: 500;
  }

  .ai-item__list-desc {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
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
