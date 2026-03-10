<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAssessment } from './composables/useAssessment';
import StepProgress from './components/StepProgress.vue';
import Step1InfoEntry from './components/Step1InfoEntry.vue';
import Step2FileUpload from './components/Step2FileUpload.vue';
import Step3AssessmentEntry from './components/Step3AssessmentEntry.vue';
import Step4ResultConfirm from './components/Step4ResultConfirm.vue';

defineOptions({ name: 'LtciAssessmentPage' });

const router = useRouter();
const { currentStep, validateBasicInfo, ensureAssessmentDraft, advanceStep } = useAssessment();
const draftLoading = ref(false);

async function handleNextToStep3() {
  const { valid, errors } = validateBasicInfo();
  if (!valid) {
    const firstError = Object.values(errors)[0];
    ElMessage.warning(firstError);
    return;
  }
  draftLoading.value = true;
  try {
    // 提前创建草稿，保证后续上传/提交都能拿到 assessmentId。
    await ensureAssessmentDraft();
    advanceStep(3);
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建评估草稿失败';
    ElMessage.error(message);
  } finally {
    draftLoading.value = false;
  }
}

function handleConfirmed() {
  advanceStep(4);
}
</script>

<template>
  <div class="ltci-page">
    <!-- Page header -->
    <div class="page-header">
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

    <!-- Step progress -->
    <StepProgress :current-step="currentStep" />

    <!-- Main content -->
    <div class="ltci-content">
      <!-- Step 1: Info entry -->
      <Step1InfoEntry />

      <!-- Step 2: File upload -->
      <Step2FileUpload />

      <!-- Navigation hint between step 2 → 3 -->
      <div
        v-if="currentStep < 3"
        class="step-nav-hint"
      >
        <el-button type="primary" :loading="draftLoading" @click="handleNextToStep3">
          <el-icon><ArrowRight /></el-icon>
          进入评估录入
        </el-button>
        <span class="step-nav-hint__tip">请先完成信息填写后继续</span>
      </div>

      <!-- Step 3: Assessment entry (shown from step 3 onward) -->
      <transition name="slide-up">
        <Step3AssessmentEntry v-if="currentStep >= 3" />
      </transition>

      <!-- Step 4: Result confirmation (shown from step 4 onward) -->
      <transition name="slide-up">
        <Step4ResultConfirm
          v-if="currentStep >= 3"
          @confirmed="handleConfirmed"
        />
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ltci-page {
  min-height: 100%;
  background: #f5f8fa;
  padding-bottom: 40px;
}

// ── Page header ─────────────────────────────────────────────────────────────

.page-header {
  background: linear-gradient(135deg, #1e6bb8 0%, #15589b 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

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
  gap: 20px;

  @media (max-width: 768px) {
    padding: 0 12px;
  }
}

// ── Step navigation hint ─────────────────────────────────────────────────────

.step-nav-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px dashed #b3d4f5;

  &__tip {
    font-size: 13px;
    color: #999;
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
</style>
