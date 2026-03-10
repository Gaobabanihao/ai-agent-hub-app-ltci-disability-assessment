<script setup lang="ts">
defineOptions({ name: 'StepProgress' });

const props = defineProps<{
  currentStep: number;
}>();

const steps = [
  { step: 1, label: '信息填写' },
  { step: 2, label: '材料上传' },
  { step: 3, label: '评估录入' },
  { step: 4, label: '结果确认' },
];

function progressWidth() {
  return `${(props.currentStep - 1) * (100 / (steps.length - 1))}%`;
}
</script>

<template>
  <div class="step-progress">
    <div class="step-track">
      <div class="step-track__line-bg" />
      <div class="step-track__line-fill" :style="{ width: progressWidth() }" />

      <div
        v-for="{ step, label } in steps"
        :key="step"
        class="step-item"
        :class="{
          'is-active': step === currentStep,
          'is-done': step < currentStep,
        }"
      >
        <div class="step-item__icon">
          <el-icon v-if="step < currentStep" size="14"><Check /></el-icon>
          <span v-else>{{ step }}</span>
        </div>
        <span class="step-item__label">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step-progress {
  max-width: 1200px;
  margin: 16px auto 0;
  padding: 0 24px;
}

.step-track {
  --step-icon-size: 32px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  &__line-bg,
  &__line-fill {
    position: absolute;
    // 让横线按圆点中心定位，而不是按整块容器高度居中。
    top: calc(var(--step-icon-size) / 2);
    left: 0;
    height: 3px;
    transform: translateY(-50%);
  }

  &__line-bg {
    width: 100%;
    background-color: #e8f4fc;
    z-index: 1;
  }

  &__line-fill {
    background-color: #1e6bb8;
    z-index: 2;
    transition: width 0.35s ease;
  }
}

.step-item {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    background-color: #e8f4fc;
    color: #7fb3d7;
    border: 2px solid #e8f4fc;
    transition: all 0.25s ease;
  }

  &__label {
    font-size: 12px;
    color: #999;
    white-space: nowrap;
    transition: color 0.25s ease;
  }

  &.is-done {
    .step-item__icon {
      background-color: #1e6bb8;
      border-color: #1e6bb8;
      color: #fff;
    }
    .step-item__label {
      color: #1e6bb8;
    }
  }

  &.is-active {
    .step-item__icon {
      background-color: #fff;
      border-color: #1e6bb8;
      color: #1e6bb8;
      box-shadow: 0 0 0 4px rgba(30, 107, 184, 0.15);
    }
    .step-item__label {
      color: #1e6bb8;
      font-weight: 600;
    }
  }
}
</style>
