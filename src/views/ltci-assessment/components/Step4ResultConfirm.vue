<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAssessment } from '../composables/useAssessment';
import { useScoring } from '../composables/useScoring';
import { useLtciAssessmentStore } from '@/store/modules/ltci-assessment';

defineOptions({ name: 'Step4ResultConfirm' });

const emit = defineEmits<{ confirmed: [] }>();

const {
  basicInfo,
  assessmentId,
  files,
  selfAssessmentData,
  assessmentItems,
  submittedAssessment,
  aiSuggestion,
  selfAssessmentExtractResult,
  selfAssessmentExtractLoading,
  aiSuggestionLoading,
  setStep,
  buildSavePayload,
  submitCurrentAssessment,
  generateCurrentAiSuggestion,
  fetchCurrentAiSuggestion,
} = useAssessment();
const { calculateResult, getSummaryText } = useScoring(
  assessmentItems,
  files,
  selfAssessmentData
);
const submitLoading = ref(false);

const result = computed(() => calculateResult());
const displayResult = computed(() => {
  if (submittedAssessment.value) {
    return {
      gradedCount: submittedAssessment.value.itemCount,
      avgGrade: submittedAssessment.value.finalScore,
      disabilityLevel: submittedAssessment.value.finalGrade,
    };
  }
  return result.value;
});
const summaryText = computed(() => getSummaryText(basicInfo, submittedAssessment.value));
const canGenerateAi = computed(
  () => !!assessmentId.value && files.selfAssessment.length > 0 && files.medical.length > 0,
);
const formattedAiSuggestion = computed(() => {
  const content = aiSuggestion.value?.suggestion;
  if (!content) return '';
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
});

const aiContent = computed(() => {
  const content = aiSuggestion.value?.content;
  return content ? content : null;
});

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

const selfAssessmentOcrResult = computed(() => {
  const suggestion = selfAssessmentExtractResult.value?.suggestion;
  if (!suggestion) return null;
  try {
    console.log(JSON.parse(suggestion));
    return JSON.parse(suggestion);
  } catch {
    return null;
  }
});

const levelTagType = computed(() => {
  const level = displayResult.value.disabilityLevel;
  if (level.includes('重度')) {
    return 'danger';
  }
  switch (level) {
    case '轻度失能':
      return 'warning';
    case '中度失能':
      return 'danger';
    default:
      return 'info';
  }
});

function handlePrint() {
  window.print();
}

function handleExport() {
  ElMessage.info('PDF 导出功能开发中，敬请期待');
}

function handleRefresh() {
  ElMessage.success('评估结论已刷新');
}

async function handleGenerateAi() {
  try {
    await generateCurrentAiSuggestion();
    ElMessage.success('AI 建议已生成');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 建议生成失败';
    ElMessage.error(message);
  }
}

async function handleFetchAi() {
  try {
    await fetchCurrentAiSuggestion();
    ElMessage.success('AI 建议已加载');
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载 AI 建议失败';
    ElMessage.error(message);
  }
}

async function handleConfirm() {
  try {
    await ElMessageBox.confirm(
      '确认提交本次评估结果？提交后将生成正式评估报告。',
      '确认提交',
      {
        confirmButtonText: '确认提交',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
  } catch {
    return;
  }
  submitLoading.value = true;
  try {
    const submitted = await submitCurrentAssessment();
    try {
      // 历史记录暂无正式列表接口，这里仅做兼容保存，不影响正式提交流程。
      await useLtciAssessmentStore().save(buildSavePayload());
    } catch {
      // 历史记录接口是兼容能力，不影响正式提交结果。
    }
    setStep(4);
    emit('confirmed');
    ElMessage.success(`评估结果已成功提交：${submitted.finalGrade}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : '提交失败，请稍后重试';
    ElMessage.error(message);
  } finally {
    submitLoading.value = false;
  }
}

function handleBack() {
  setStep(3);
}
</script>

<template>
  <div class="result-card">
    <div class="card-header-new">
      <el-icon class="card-header__icon">
        <DocumentChecked />
      </el-icon>
      <h2>评估结果确认</h2>

      <div class="card-header__actions">
        <el-button color="#67c23a" size="small" plain @click="handleRefresh">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新汇总
        </el-button>
        <el-button color="#67c23a" size="small" plain @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          导出PDF
        </el-button>
        <el-button color="#67c23a" size="small" plain @click="handlePrint">
          <el-icon>
            <Printer />
          </el-icon>
          打印报告
        </el-button>
      </div>
    </div>

    <!-- Grade summary banner -->
    <div class="grade-banner" v-if="displayResult.gradedCount > 0">
      <div class="grade-banner__item">
        <span class="grade-banner__value">{{ displayResult.gradedCount }}</span>
        <span class="grade-banner__label">已评估项目</span>
      </div>
      <div class="grade-banner__divider" />
      <div class="grade-banner__item">
        <span class="grade-banner__value">{{ displayResult.avgGrade.toFixed(1) }}</span>
        <span class="grade-banner__label">综合得分</span>
      </div>
      <div class="grade-banner__divider" />
      <div class="grade-banner__item">
        <el-tag :type="levelTagType" size="large" effect="dark">
          {{ displayResult.disabilityLevel }}
        </el-tag>
        <span class="grade-banner__label">失能等级</span>
      </div>
    </div>

    <!-- Summary text content -->
    <!-- <div class="summary-body">
      <h3 class="summary-body__title">
        <el-icon><Memo /></el-icon>
        评估结论汇总
      </h3>
      <pre class="summary-body__content">{{ summaryText }}</pre>
    </div> -->

    <!-- AI 智能评估建议 -->
    <div class="summary-body">
      <!-- <h3 class="summary-body__title">
        <el-icon><MagicStick /></el-icon>
        AI 智能评估建议
      </h3>
      <div class="summary-body__toolbar">
        <el-button
          type="primary"
          :loading="aiSuggestionLoading"
          :disabled="!canGenerateAi"
          @click="handleGenerateAi"
        >
          <el-icon><Promotion /></el-icon>
          {{ aiSuggestion ? '重新生成 AI 建议' : '生成 AI 建议' }}
        </el-button>
        <el-button
          :loading="aiSuggestionLoading"
          :disabled="!assessmentId"
          @click="handleFetchAi"
        >
          <el-icon><Refresh /></el-icon>
          查询已生成建议
        </el-button>
        <span v-if="!canGenerateAi" class="summary-body__hint">
          需先上传客户自评表和医疗材料后才能生成 AI 建议
        </span>
      </div> -->

      <div class="ai-result">
        <!-- <div class="ai-result__meta">
          <span>生成时间：{{ new Date(aiSuggestion.createTime).toLocaleString('zh-CN') }}</span>
          <span>Token：{{ aiSuggestion.totalTokens }}</span>
          <span v-if="aiSuggestion.finishReason">结束原因：{{ aiSuggestion.finishReason }}</span>
        </div> -->

        <!-- 自评表结果 -->
        <div class="ai-section">
          <h4 class="ai-section__title">
            <el-icon>
              <Document />
            </el-icon>
            自评表结果
          </h4>
          <div v-if="selfAssessmentExtractLoading" class="ai-section__loading">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>解析中...</span>
          </div>
          <div v-else-if="selfAssessmentOcrResult" class="ai-section__content">
            <div class="self-assessment-content">
              <div v-if="selfAssessmentOcrResult['自评表结果']" class="self-assessment-result">
                <div v-if="selfAssessmentOcrResult['自评表结果']['ADL自评']" class="self-assessment-section">
                  <h5 class="self-assessment-section__title">ADL自评</h5>
                  <div class="self-assessment-section__content">
                    <div v-for="(item, index) in selfAssessmentOcrResult['自评表结果']['ADL自评']" :key="index"
                      class="self-assessment-item">
                      <span class="self-assessment-item__label">{{ item.项目 }}：</span>
                      <span class="self-assessment-item__value">{{ item.自评结果 }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="selfAssessmentOcrResult['自评表结果']['自评失能等级']" class="self-assessment-section">
                  <h5 class="self-assessment-section__title">自评失能等级</h5>
                  <div class="self-assessment-section__content">
                    <span class="self-assessment-grade">{{ selfAssessmentOcrResult['自评表结果']['自评失能等级'] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="ai-section__empty">
            暂无自评表结果
          </div>
        </div>

        <!-- 智能评估结果摘要 -->
        <div v-if="aiSuggestion">
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
        <div v-else class="summary-body__empty">
          暂未生成 AI 建议
        </div>
      </div>

    </div>


  </div>
</template>

<style lang="scss" scoped>
.result-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #1e6bb8 0%, #2d7fc7 100%);
  color: #fff;

  &__icon {
    font-size: 20px;
  }

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    flex: 1;
  }

  &__actions {
    display: flex;
    gap: 8px;

    .el-button {
      --el-button-text-color: #fff;
      --el-button-border-color: rgba(255, 255, 255, 0.5);
      --el-button-bg-color: transparent;
      --el-button-hover-text-color: #fff;
      --el-button-hover-border-color: #fff;
      --el-button-hover-bg-color: rgba(255, 255, 255, 0.15);
    }
  }
}

.card-header-new {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: #f0f9eb;
  color: #67c23a;

  &__icon {
    font-size: 20px;
  }

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    flex: 1;
  }

  &__actions {
    display: flex;
    gap: 8px;
    color: #67c23a;

    .el-button {
      --el-button-text-color: #fff;
      --el-button-border-color: rgba(255, 255, 255, 0.5);
      --el-button-bg-color: transparent;
      --el-button-hover-text-color: #fff;
      --el-button-hover-border-color: #fff;
      --el-button-hover-bg-color: rgba(255, 255, 255, 0.15);
    }
  }
}


// ── Grade banner ────────────────────────────────────────────────────────────

.grade-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 24px 32px;
  background: #f8faff;
  border-bottom: 1px solid #e8f4fc;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
    text-align: center;
  }

  &__value {
    font-size: 28px;
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
    height: 40px;
    background: #e8f4fc;
    flex-shrink: 0;
  }
}

// ── Summary body ────────────────────────────────────────────────────────────

.summary-body {
  padding: 20px 24px;

  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #1e6bb8;
    margin: 0 0 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e8f4fc;
  }

  &__content {
    font-size: 13px;
    color: #444;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
    background: #f8fafc;
    border: 1px solid #e8f4fc;
    border-radius: 6px;
    padding: 16px;
    min-height: 200px;
    font-family: inherit;
    margin: 0;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  &__hint {
    font-size: 12px;
    color: #999;
  }

  &__empty {
    font-size: 13px;
    color: #999;
    padding: 16px;
    background: #f8fafc;
    border: 1px dashed #d8e6f2;
    border-radius: 6px;
  }
}

.ai-result {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 12px;
    color: #666;
    padding: 12px 16px;
    background: #f8fafc;
    border: 1px solid #e8f4fc;
    border-radius: 6px;
  }
}

// ── AI Section ──────────────────────────────────────────────────────────────

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

.self-assessment-content {
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

// ── Footer ──────────────────────────────────────────────────────────────────

.result-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f7ff;
  background: #fafcff;
}

// ── Print styles ────────────────────────────────────────────────────────────

@media print {

  .card-header__actions,
  .result-footer {
    display: none;
  }
}
</style>
