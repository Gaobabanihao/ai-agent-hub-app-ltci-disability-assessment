<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAssessment } from './composables/useAssessment';
import { useScoring } from './composables/useScoring';
import { useLtciAssessmentStore } from '@/store/modules/ltci-assessment';
import StepProgress from './components/StepProgress.vue';
import Step1InfoEntry from './components/Step1InfoEntry.vue';
import Step2FileUpload from './components/Step2FileUpload.vue';
import Step3VideoUpload from './components/Step3VideoUpload.vue';
import Step3AssessmentEntry from './components/Step3AssessmentEntry.vue';
import Step4ResultConfirm from './components/Step4ResultConfirm.vue';

defineOptions({ name: 'LtciAssessmentPage' });

const router = useRouter();
const {  
  currentStep,  
  validateBasicInfo,  
  ensureAssessmentDraft,  
  advanceStep,  
  files,  
  generateCurrentAiSuggestion,
  assessmentItems,
  setStep,
  submitCurrentAssessment,
  buildSavePayload,
} = useAssessment();
const draftLoading = ref(false);
const submitLoading = ref(false);

// 计算结果
const { calculateResult } = useScoring(
  assessmentItems,
  files,
  null
);
const result = computed(() => calculateResult());

// 检查是否上传了自评表或医疗材料
const hasUploadedRequiredFiles = computed(() => {
  return files.selfAssessment.length > 0 || files.medical.length > 0;
});

// 检查是否上传了音视频文件
const hasUploadedVideoFiles = computed(() => {
  return files.video.length > 0;
});

async function handleGenerateAiSuggestionStep2() {
  const { valid, errors } = validateBasicInfo();
  if (!valid) {
    const firstError = Object.values(errors)[0];
    ElMessage.warning(firstError);
    return;
  }

  if (!hasUploadedRequiredFiles.value) {
    ElMessage.warning('请至少上传自评表或医疗材料后再生成 AI 建议');
    return;
  }

  draftLoading.value = true;
  try {
    // 先创建草稿（如果尚未创建），再生成 AI 建议并自动写入评估项
    await ensureAssessmentDraft();
    await generateCurrentAiSuggestion();
    advanceStep(3);
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成 AI 建议失败';
    ElMessage.error(message);
  } finally {
    draftLoading.value = false;
  }
}

async function handleGenerateAiSuggestionStep3() {
  const { valid, errors } = validateBasicInfo();
  if (!valid) {
    const firstError = Object.values(errors)[0];
    ElMessage.warning(firstError);
    return;
  }

  if (!hasUploadedVideoFiles.value) {
    ElMessage.warning('请上传音视频文件后再生成 AI 建议');
    return;
  }

  draftLoading.value = true;
  try {
    // 先创建草稿（如果尚未创建），再生成 AI 建议并自动写入评估项
    await ensureAssessmentDraft();
    await generateCurrentAiSuggestion();
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成 AI 建议失败';
    ElMessage.error(message);
  } finally {
    draftLoading.value = false;
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
    ElMessage.success(`评估结果已成功提交：${submitted.finalGrade}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : '提交失败，请稍后重试';
    ElMessage.error(message);
  } finally {
    submitLoading.value = false;
  }
}

function handleStepClick(step: number) {
  // 只能跳转到已完成或当前步骤
  if (step <= currentStep.value) {
    // 跳转到对应锚点
    const stepId = `step${step}`;
    const element = document.getElementById(stepId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
</script>

<template>
  <div class="ltci-page">
    <!-- Page header - 粘性布局 -->
    <div class="page-header sticky-header">
      <div class="page-header__inner">
        <div class="page-header__title">
          <el-icon><Medal /></el-icon>
          <h1>长期护理保险失能等级评估系统</h1>
        </div>
        <el-button plain size="small" @click="router.push('/ltci-assessment/history')">
          <el-icon><Clock /></el-icon>
          历史记录
        </el-button>
      </div>
    </div>

    <!-- Step progress - 粘性布局 -->
    <StepProgress :current-step="currentStep" @step-click="handleStepClick" />

    <!-- Main content -->
    <div class="ltci-content">
      <!-- Step 1: 基本信息填写 -->
      <div id="step1" class="step-section">
        <div class="card-header">
          <el-icon><UserFilled /></el-icon>
          <h2>基本信息填写</h2>
        </div>
        <div class="step-content">
          <Step1InfoEntry />
        </div>
      </div>

      <!-- Step 2: AI事前预评估分析 -->
      <div id="step2" class="step-section">
        <div class="card-header">
          <el-icon><MagicStick /></el-icon>
          <h2>AI事前预评估分析</h2>
        </div>
        <div class="step-content">
          <!-- 文件上传：仅自评表和医疗材料 -->
          <Step2FileUpload />
          
          <!-- 生成AI建议按钮 -->
          <div class="step-nav-hint">
            <el-button
              type="primary"
              :loading="draftLoading"
              @click="handleGenerateAiSuggestionStep2"
            >
              <el-icon><ArrowRight /></el-icon>
              生成 AI 建议
            </el-button>
            <span class="step-nav-hint__tip">
              {{ hasUploadedRequiredFiles ? '生成 AI 建议后可进入事中/后建议' : '请至少上传自评表或医疗材料后再生成 AI 建议' }}
            </span>
          </div>
          
          <!-- 评估结果确认 -->
          <transition name="slide-up">
            <Step4ResultConfirm
              v-if="currentStep >= 2"
              @confirmed="handleConfirmed"
            />
          </transition>
        </div>
      </div>

      <!-- Step 3: 事中/后建议 -->
      <div id="step3" class="step-section">
        <div class="card-header">
           <el-icon><Promotion /></el-icon>
          <h2>事中/后建议</h2>
        </div>
        <div class="step-content">
          <!-- 音视频上传 -->
          <div class="video-upload-section">
            <h3>音视频材料上传</h3>
            <p class="video-upload-section__desc">请上传评估过程中的音视频材料，用于辅助评估。</p>
            <Step3VideoUpload />
          </div>
          
          <!-- 生成AI建议按钮 -->
          <div class="step-nav-hint">
            <el-button
              type="primary"
              :loading="draftLoading"
              @click="handleGenerateAiSuggestionStep3"
            >
              <el-icon><ArrowRight /></el-icon>
              生成 AI 建议
            </el-button>
            <span class="step-nav-hint__tip">
              {{ hasUploadedVideoFiles ? '生成 AI 建议' : '请上传音视频文件后再生成 AI 建议' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Step 4: 量表录入 -->
      <div id="step4" class="step-section">
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <h2>量表录入</h2>
        </div>
        <div class="step-content">
          <!-- 评估录入 -->
          <transition name="slide-up">
            <Step3AssessmentEntry />
          </transition>
          
          <!-- 结果确认底部按钮 -->
          <div class="result-footer">
            <el-button @click="() => setStep(3)">
              <el-icon><ArrowLeft /></el-icon>
              返回修改
            </el-button>
            <el-button
              type="primary"
              :disabled="result.gradedCount < assessmentItems.length"
              :loading="submitLoading"
              @click="handleConfirm"
            >
              <el-icon><CircleCheck /></el-icon>
              确认提交结果
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ltci-page {
  min-height: 100%;
  background: #f5f8fa;
  padding-bottom: 40px;
}

// ── Page header - 粘性布局 ───────────────────────────────────────────────────

.page-header {
  background: linear-gradient(135deg, #1e6bb8 0%, #15589b 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 101;

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

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
    gap: 10px;
    color: #fff;

    .el-icon {
      font-size: 22px;
    }

    h1 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
  }
}

// ── Content area ─────────────────────────────────────────────────────────────

.ltci-content {
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (max-width: 768px) {
    padding: 0 12px;
  }
}

// ── Step section ─────────────────────────────────────────────────────────────

.step-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

// ── Card header ──────────────────────────────────────────────────────────────

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #1e6bb8 0%, #2d7fc7 100%);
  color: #fff;

  .el-icon {
    font-size: 20px;
  }

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
}

// ── Step content ─────────────────────────────────────────────────────────────

.step-content {
  padding: 24px;
}

// ── Step navigation hint ─────────────────────────────────────────────────────

.step-nav-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #f0f7ff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px dashed #b3d4f5;
  margin: 20px 0;

  &__tip {
    font-size: 13px;
    color: #666;
  }
}

// ── AI结果确认 ───────────────────────────────────────────────────────────────

.ai-result-confirm {
  background: #f9fdf7;
  border: 1px solid #e8f4fc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #28a745;
    margin: 0 0 8px 0;
  }

  &__desc {
    font-size: 13px;
    color: #666;
    margin: 0;
  }
}

// ── 音视频上传 section ───────────────────────────────────────────────────────

.video-upload-section {
  background: #fdf0e8;
  border: 1px solid #f5e0d3;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #d07020;
    margin: 0 0 8px 0;
  }

  &__desc {
    font-size: 13px;
    color: #666;
    margin: 0;
  }
}

// ── 评估录入 section ─────────────────────────────────────────────────────────

.assessment-entry-section {
  background: #f0f7ff;
  border: 1px solid #e8f4fc;
  border-radius: 8px;
  padding: 20px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1e6bb8;
    margin: 0 0 8px 0;
  }

  &__desc {
    font-size: 13px;
    color: #666;
    margin: 0;
  }
}

// ── Transition ───────────────────────────────────────────────────────────────

.slide-up-enter-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

// ── Result footer ────────────────────────────────────────────────────────────

.result-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f7ff;
  background: #fafcff;
  margin-top: 24px;
  border-radius: 8px;
}
</style>
