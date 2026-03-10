<script setup lang="ts">
/**
 * 高级特性 Demo
 * 演示：draggable / loading 覆盖层 / confirmDisabled / expose ref / closeOnClickModal
 */
import { ref } from 'vue';
import { AppDialog } from '@/components/Dialog';
import type { DialogExpose } from '@/components/Dialog';

defineOptions({ name: 'DialogAdvancedDemo' });

// ---- 1. 可拖拽 ----
const draggable = ref(false);

// ---- 2. loading 覆盖层 ----
const loadingDialog = ref(false);
const contentLoading = ref(false);

function openLoadingDialog() {
  loadingDialog.value = true;
  contentLoading.value = true;
  setTimeout(() => {
    contentLoading.value = false;
  }, 1800);
}

// ---- 3. confirmDisabled（表单验证场景） ----
const formDialog = ref(false);
const formInput = ref('');

// ---- 4. expose ref：外部控制全屏 ----
const exposeDialog = ref(false);
const dialogRef = ref<DialogExpose>();

// ---- 5. closeOnClickModal ----
const modalClickDialog = ref(false);
</script>

<template>
  <div class="demo-section">
    <!-- ---- 1. 可拖拽 ---- -->
    <h3 class="section-title">draggable 可拖拽</h3>
    <p class="section-desc">
      传入 <code>:draggable="true"</code> 开启 ElDialog 原生拖拽功能，
      拖动 header 区域可自由移动弹窗位置。
    </p>
    <ElButton type="primary" @click="draggable = true">打开（可拖拽）</ElButton>

    <AppDialog
      v-model="draggable"
      title="可拖拽弹窗"
      width="420px"
      :draggable="true"
      @confirm="draggable = false"
    >
      <p>拖动顶部标题栏，可将弹窗移动到屏幕任意位置。</p>
      <p style="color: var(--el-text-color-secondary); font-size: 13px;">
        提示：与 <code>fullscreen</code> 同时使用时，全屏模式下拖拽无效。
      </p>
    </AppDialog>

    <ElDivider />

    <!-- ---- 2. loading 覆盖层 ---- -->
    <h3 class="section-title">loading 内容加载中</h3>
    <p class="section-desc">
      <code>:loading="true"</code> 会在内容区域上方显示半透明遮罩和旋转动画，
      适用于异步加载详情数据的场景。
    </p>
    <ElButton type="primary" @click="openLoadingDialog">打开（内容加载）</ElButton>

    <AppDialog
      v-model="loadingDialog"
      title="日报详情"
      width="480px"
      :loading="contentLoading"
      @confirm="loadingDialog = false"
    >
      <div v-if="!contentLoading">
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="提交时间">2026-03-04 09:30</ElDescriptionsItem>
          <ElDescriptionsItem label="工作内容">完成了首页改版的需求评审，输出评审纪要</ElDescriptionsItem>
          <ElDescriptionsItem label="遇到问题">布局方案存在分歧，已与设计师沟通对齐</ElDescriptionsItem>
          <ElDescriptionsItem label="明日计划">开始首页组件开发，预计完成 50%</ElDescriptionsItem>
        </ElDescriptions>
      </div>
      <div v-else style="height: 120px;" />
    </AppDialog>

    <ElDivider />

    <!-- ---- 3. confirmDisabled ---- -->
    <h3 class="section-title">confirmDisabled 按钮禁用</h3>
    <p class="section-desc">
      <code>:confirm-disabled="true"</code> 禁用确认按钮，常用于表单未填写完整时。
      此示例在输入框有内容时才启用确认按钮。
    </p>
    <ElButton type="primary" @click="formDialog = true">打开（需填写）</ElButton>

    <AppDialog
      v-model="formDialog"
      title="新建备注"
      width="440px"
      :confirm-disabled="!formInput.trim()"
      @confirm="() => { ElMessage.success('已保存：' + formInput); formDialog = false; formInput = ''; }"
      @cancel="() => { formDialog = false; formInput = ''; }"
    >
      <ElInput
        v-model="formInput"
        type="textarea"
        :rows="4"
        placeholder="请输入备注内容（输入后才可提交）"
        autofocus
      />
    </AppDialog>

    <ElDivider />

    <!-- ---- 4. expose ref：外部控制全屏 ---- -->
    <h3 class="section-title">expose ref 外部控制全屏</h3>
    <p class="section-desc">
      通过模板 ref 获取 <code>DialogExpose</code>，可从弹窗外部调用
      <code>toggleFullscreen()</code> 或读取 <code>isFullscreen</code> 状态。
    </p>
    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
      <ElButton type="primary" @click="exposeDialog = true">打开弹窗</ElButton>
      <ElButton
        :disabled="!exposeDialog"
        @click="dialogRef?.toggleFullscreen()"
      >
        外部切换全屏
      </ElButton>
      <ElTag v-if="exposeDialog" :type="dialogRef?.isFullscreen.value ? 'success' : 'info'">
        {{ dialogRef?.isFullscreen.value ? '全屏模式' : '窗口模式' }}
      </ElTag>
    </div>

    <AppDialog
      ref="dialogRef"
      v-model="exposeDialog"
      title="Expose 示例"
      width="460px"
      @confirm="exposeDialog = false"
    >
      <p>可以点击右上角全屏按钮，也可以点击弹窗外部的「外部切换全屏」按钮。</p>
      <p style="color: var(--el-text-color-secondary); font-size: 13px;">
        当前状态通过 <code>dialogRef.isFullscreen</code> 实时读取并展示在按钮右侧。
      </p>
    </AppDialog>

    <ElDivider />

    <!-- ---- 5. closeOnClickModal ---- -->
    <h3 class="section-title">closeOnClickModal 点击遮罩关闭</h3>
    <p class="section-desc">
      默认 <code>closeOnClickModal="false"</code>，防止用户误触遮罩关闭表单。
      将其设为 <code>true</code> 可启用点击遮罩关闭行为，适用于只读预览场景。
    </p>
    <ElButton type="primary" @click="modalClickDialog = true">
      打开（点击遮罩可关闭）
    </ElButton>

    <AppDialog
      v-model="modalClickDialog"
      title="点击遮罩关闭"
      width="420px"
      :close-on-click-modal="true"
      :show-footer="false"
    >
      <ElResult
        icon="success"
        title="只读预览"
        sub-title="此弹窗为预览模式，点击外部遮罩区域即可关闭，无需操作按钮。"
      />
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
