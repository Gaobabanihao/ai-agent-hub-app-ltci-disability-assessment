<script setup lang="ts">
/**
 * 插槽定制 Demo
 * 演示：#title / #header / #footer / #prepend-footer / #append-footer
 */
import { ref } from 'vue';
import { AppDialog } from '@/components/Dialog';

defineOptions({ name: 'DialogSlotDemo' });

// ---- 1. #title 插槽（替换标题文字，保留全屏按钮） ----
const titleSlot = ref(false);

// ---- 2. #header 插槽（完全接管 header） ----
const headerSlot = ref(false);

// ---- 3. #prepend-footer + #append-footer ----
const extFooter = ref(false);

// ---- 4. #footer 插槽（完全接管底部） ----
const customFooter = ref(false);

function handleShare(): void {
  ElMessage.success('分享链接已复制');
}
</script>

<template>
  <div class="demo-section">
    <!-- ---- #title 插槽 ---- -->
    <h3 class="section-title">#title 插槽</h3>
    <p class="section-desc">
      只替换标题文字部分，全屏切换按钮仍由组件管理。
      适用于需要在标题区放置标签、徽标等额外内容的场景。
    </p>
    <ElButton type="primary" @click="titleSlot = true">打开（自定义标题）</ElButton>

    <AppDialog v-model="titleSlot" width="500px" @confirm="titleSlot = false">
      <template #title>
        <span style="margin-right: 8px;">日报详情</span>
        <ElTag type="success" size="small">进行中</ElTag>
        <ElTag type="warning" size="small" style="margin-left: 4px;">待审批</ElTag>
      </template>
      <template #extra-actions>
        <button class="app-dialog__action-btn" @click="handleShare">
          <ElIcon><Share /></ElIcon>
        </button>
      </template>
      <p>通过 <code>#title</code> 插槽可以在标题区域插入任意内容，例如状态标签。</p>
    </AppDialog>

    <ElDivider />

    <!-- ---- #header 插槽 ---- -->
    <h3 class="section-title">#header 插槽</h3>
    <p class="section-desc">
      完全接管整个 header 区域，包括关闭按钮以外的所有内容。
      适用于需要自定义 header 布局的场景。
    </p>
    <ElButton type="primary" @click="headerSlot = true">打开（自定义 header）</ElButton>

    <AppDialog v-model="headerSlot" width="500px" @confirm="headerSlot = false">
      <template #header="{ titleId, titleClass }">
        <div style="display: flex; align-items: center; gap: 10px;">
          <ElAvatar :size="32" style="background: var(--el-color-primary);">A</ElAvatar>
          <div>
            <div :id="titleId" :class="titleClass" style="font-weight: 600; font-size: 15px;">
              张三的日报
            </div>
            <div style="font-size: 12px; color: var(--el-text-color-secondary);">
              2026-03-04 提交
            </div>
          </div>
        </div>
      </template>
      <p>
        通过 <code>#header</code> 插槽可以完全自定义 header。<br />
        插槽参数 <code>{ titleId, titleClass }</code> 来自 ElDialog，
        用于 aria 无障碍支持。
      </p>
    </AppDialog>

    <ElDivider />

    <!-- ---- #prepend-footer + #append-footer ---- -->
    <h3 class="section-title">#prepend-footer / #append-footer</h3>
    <p class="section-desc">
      在默认的取消/确认按钮前后插入额外按钮，不影响默认按钮的行为。
    </p>
    <ElButton type="primary" @click="extFooter = true">打开（扩展底部）</ElButton>

    <AppDialog
      v-model="extFooter"
      title="扩展底部按钮"
      width="500px"
      @confirm="extFooter = false"
    >
      <template #prepend-footer>
        <ElButton @click="() => ElMessage.info('草稿已保存')">存草稿</ElButton>
      </template>
      <template #append-footer>
        <ElButton type="warning" @click="() => ElMessage.warning('已重置')">重置</ElButton>
      </template>
      <p>底部按钮顺序：「存草稿」→「取消」→「确认」→「重置」。</p>
    </AppDialog>

    <ElDivider />

    <!-- ---- #footer 插槽 ---- -->
    <h3 class="section-title">#footer 插槽</h3>
    <p class="section-desc">
      完全接管 footer 区域，渲染自定义按钮组，适用于危险操作确认等特殊场景。
    </p>
    <ElButton type="primary" @click="customFooter = true">打开（完全自定义底部）</ElButton>

    <AppDialog
      v-model="customFooter"
      title="危险操作确认"
      width="480px"
    >
      <ElAlert
        title="此操作不可撤销，请谨慎操作！"
        type="error"
        :closable="false"
        show-icon
        style="margin-bottom: 12px;"
      />
      <p>确认删除后，数据将被永久清除，无法恢复。</p>

      <template #footer>
        <ElButton @click="customFooter = false">我再想想</ElButton>
        <ElButton
          type="danger"
          @click="() => { ElMessage.error('已删除（演示）'); customFooter = false; }"
        >
          确认删除
        </ElButton>
      </template>
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
