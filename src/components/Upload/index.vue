<template>
  <el-upload
    ref="uploadRef"
    v-bind="$attrs"
    :action="action"
    :headers="headers"
    :before-upload="handleBeforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-progress="handleProgress"
    :on-exceed="handleExceed"
    :file-list="fileList"
    :limit="limit"
    :accept="accept"
    :multiple="multiple"
    :drag="drag"
  >
    <template v-if="drag">
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </template>
    <template v-else>
      <slot>
        <el-button type="primary">
          <el-icon><Upload /></el-icon>
          <span>点击上传</span>
        </el-button>
      </slot>
    </template>

    <template #tip>
      <slot name="tip">
        <div v-if="tip" class="el-upload__tip">{{ tip }}</div>
      </slot>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { UploadInstance, UploadFile, UploadFiles, UploadRawFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Upload, UploadFilled } from '@element-plus/icons-vue';
import { getToken } from '@/utils/auth';

defineOptions({ name: 'FileUpload' });

const props = withDefaults(defineProps<{
  /** 上传地址 */
  action?: string;
  /** 文件列表 */
  modelValue?: UploadFile[];
  /** 最大上传数量 */
  limit?: number;
  /** 接受的文件类型 */
  accept?: string;
  /** 是否支持多选 */
  multiple?: boolean;
  /** 是否启用拖拽上传 */
  drag?: boolean;
  /** 最大文件大小（MB） */
  maxSize?: number;
  /** 提示文字 */
  tip?: string;
}>(), {
  action: '/api/upload',
  modelValue: () => [],
  limit: 5,
  accept: '',
  multiple: false,
  drag: false,
  maxSize: 10,
  tip: '',
});

const emit = defineEmits<{
  'update:modelValue': [files: UploadFile[]];
  'success': [response: unknown, file: UploadFile, fileList: UploadFiles];
  'error': [error: Error, file: UploadFile, fileList: UploadFiles];
  'progress': [event: ProgressEvent, file: UploadFile, fileList: UploadFiles];
}>();

const uploadRef = ref<UploadInstance>();

const fileList = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

/** 请求头 */
const headers = computed(() => ({
  Authorization: `Bearer ${getToken()}`,
}));

/** 上传前校验 */
function handleBeforeUpload(file: UploadRawFile) {
  // 校验文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize;
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`);
    return false;
  }

  // 校验文件类型
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map((t) => t.trim());
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const fileMime = file.type;

    const isValidType = acceptTypes.some((type) => {
      if (type.startsWith('.')) {
        return fileExt === type.toLowerCase();
      }
      if (type.endsWith('/*')) {
        return fileMime.startsWith(type.replace('/*', '/'));
      }
      return fileMime === type;
    });

    if (!isValidType) {
      ElMessage.error(`只能上传 ${props.accept} 格式的文件`);
      return false;
    }
  }

  return true;
}

/** 上传成功 */
function handleSuccess(response: unknown, file: UploadFile, files: UploadFiles) {
  emit('update:modelValue', files);
  emit('success', response, file, files);
  ElMessage.success('上传成功');
}

/** 上传失败 */
function handleError(error: Error, file: UploadFile, files: UploadFiles) {
  emit('error', error, file, files);
  ElMessage.error('上传失败');
}

/** 上传进度 */
function handleProgress(event: ProgressEvent, file: UploadFile, files: UploadFiles) {
  emit('progress', event, file, files);
}

/** 超出限制 */
function handleExceed() {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`);
}

/** 清空文件列表 */
function clearFiles() {
  uploadRef.value?.clearFiles();
}

/** 手动上传 */
function submit() {
  uploadRef.value?.submit();
}

/** 取消上传 */
function abort(file?: UploadFile) {
  if (file) {
    uploadRef.value?.abort(file);
  }
}

defineExpose({
  /** 清空文件列表 */
  clearFiles,
  /** 手动上传 */
  submit,
  /** 取消上传 */
  abort,
  /** 上传组件实例 */
  uploadRef,
});
</script>

<style scoped lang="scss">
.el-upload__tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
