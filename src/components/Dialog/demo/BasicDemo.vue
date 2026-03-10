<script setup lang="ts">
/**
 * 基础用法 Demo
 * 演示：基础打开关闭 / 确认 loading / 无底部 / 初始全屏
 */
import { ref } from 'vue';
import { AppDialog } from '@/components/Dialog';

defineOptions({ name: 'DialogBasicDemo' });

// ---- 1. 基础打开/关闭 ----
const basic = ref(false);

// ---- 2. 确认按钮 loading（模拟异步保存） ----
const withLoading = ref(false);
const confirmLoading = ref(false);

async function handleConfirmWithLoading() {
  confirmLoading.value = true;
  await new Promise(r => setTimeout(r, 1500));
  confirmLoading.value = false;
  withLoading.value = false;
}

// ---- 3. 无底部 ----
const noFooter = ref(false);

// ---- 4. 初始全屏 ----
const initFullscreen = ref(false);
</script>

<template>
  <div class="demo-section">
    <h3 class="section-title">基础打开 / 关闭</h3>
    <p class="section-desc">最简用法：title prop + 默认 footer（取消/确认按钮）。</p>
    <ElButton type="primary" @click="basic = true">打开弹窗</ElButton>

    <AppDialog
      v-model="basic"
      title="基础弹窗"
      width="480px"
      @confirm="basic = false"
    >
      <p>这是弹窗的内容区域，可以放置任意内容。</p>
      <p>点击右上角关闭按钮、Esc 键或「取消」按钮均可关闭。</p>
    </AppDialog>

    <ElDivider />

    <h3 class="section-title">确认按钮 loading</h3>
    <p class="section-desc">
      通过 <code>confirm-loading</code> 控制确认按钮的 loading 状态，适用于异步提交场景。
    </p>
    <ElButton type="primary" @click="withLoading = true">模拟异步保存</ElButton>

    <AppDialog
      v-model="withLoading"
      title="异步保存"
      width="480px"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirmWithLoading"
    >
      <p>点击「确认」后模拟 1.5s 的异步保存，期间确认按钮显示 loading 状态。</p>
    </AppDialog>

    <ElDivider />

    <h3 class="section-title">隐藏底部操作栏</h3>
    <p class="section-desc">
      <code>:show-footer="false"</code> 隐藏底部，适用于纯展示型弹窗。
    </p>
    <ElButton type="primary" @click="noFooter = true">打开（无底部）</ElButton>

    <AppDialog
      v-model="noFooter"
      title="纯展示弹窗"
      width="480px"
      :show-footer="false"
    >
      <ElResult
        icon="success"
        title="操作成功"
        sub-title="请点击右上角关闭按钮退出"
      />
    </AppDialog>

    <ElDivider />

    <h3 class="section-title">初始全屏</h3>
    <p class="section-desc">
      传入 <code>:fullscreen="true"</code> 时弹窗以全屏状态打开，
      仍可通过全屏按钮切换回窗口模式，关闭后下次打开还原全屏。
    </p>
    <ElButton type="primary" @click="initFullscreen = true">打开（初始全屏）</ElButton>

    <AppDialog
      v-model="initFullscreen"
      title="初始全屏弹窗"
      :fullscreen="true"
      @confirm="initFullscreen = false"
    >
      <p>当前以全屏模式打开。点击右上角全屏图标可切换到窗口模式。</p>
      <p>关闭弹窗后再次打开，仍会以全屏模式呈现（重置到 fullscreen prop 的值）。</p>
    </AppDialog>
  </div>
</template>

<style scoped lang="scss">
.demo-section {
  padding: 16px 0;
}

.section-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-desc {
  margin: 0 0 12px;
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
</style>
