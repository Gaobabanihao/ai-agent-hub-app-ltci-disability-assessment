<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAssessment } from '../composables/useAssessment';
import type { FileInfo, FileUploadType } from '../types';

defineOptions({ name: 'Step3VideoUpload' });

const { files, addFiles, removeFile } = useAssessment();

const fileInputRefs = ref<Record<string, HTMLInputElement | null>>({});
// 按分组维护 loading，避免一个文件组上传时阻塞其它组操作。
const uploadLoading = reactive<Record<FileUploadType, boolean>>({
  selfAssessment: false,
  medical: false,
  video: false,
});
const deleteLoading = reactive<Record<FileUploadType, boolean>>({
  selfAssessment: false,
  medical: false,
  video: false,
});

function triggerUpload() {
  fileInputRefs.value['video']?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  uploadLoading['video'] = true;
  try {
    await addFiles('video', Array.from(input.files));
    ElMessage.success('文件上传成功');
  } catch (error) {
    const message = error instanceof Error ? error.message : '文件上传失败';
    ElMessage.error(message);
  } finally {
    uploadLoading['video'] = false;
    input.value = '';
  }
}

async function handleDelete(id: string) {
  deleteLoading['video'] = true;
  try {
    await removeFile('video', id);
    ElMessage.success('文件已删除');
  } catch (error) {
    const message = error instanceof Error ? error.message : '文件删除失败';
    ElMessage.error(message);
  } finally {
    deleteLoading['video'] = false;
  }
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['mp4', 'avi', 'mov'].includes(ext)) return 'VideoPlay';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'Headset';
  return 'Files';
}
</script>

<template>
  <div class="video-upload-card">
    <div class="upload-section">
      <div class="upload-section__head">
        <div class="upload-section__title">
          <el-icon><VideoPlay /></el-icon>
          <span>音视频材料</span>
        </div>
        <el-button
          type="primary"
          size="small"
          plain
          :loading="uploadLoading.video"
          @click="triggerUpload"
        >
          <el-icon><Plus /></el-icon>
          上传文件
        </el-button>
        <input
          ref="(el) => (fileInputRefs['video'] = el as HTMLInputElement)"
          type="file"
          accept=".mp4,.mp3,.avi,.mov,.wav,.ogg"
          multiple
          class="hidden-input"
          @change="handleFileChange"
        />
      </div>

      <p class="upload-section__desc">支持 MP4、MP3、AVI、MOV、WAV、OGG 格式</p>

      <transition-group
        name="file-list"
        tag="div"
        class="file-list"
      >
        <div
          v-for="file in (files.video as FileInfo[])"
          :key="file.id"
          class="file-item"
        >
          <el-icon class="file-item__icon"><component :is="getFileIcon(file.name)" /></el-icon>
          <div class="file-item__info">
            <span class="file-item__name">{{ file.name }}</span>
            <span class="file-item__meta">{{ file.size }} · {{ file.time }}</span>
          </div>
          <el-button
            type="danger"
            size="small"
            text
            circle
            :loading="deleteLoading.video"
            @click="handleDelete(file.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </transition-group>

      <div
        v-if="!(files.video as FileInfo[]).length"
        class="file-empty"
      >
        <el-icon><FolderOpened /></el-icon>
        <span>暂无上传文件</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-upload-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.upload-section {
  padding: 20px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #1e6bb8;

    .el-icon {
      font-size: 16px;
    }
  }

  &__desc {
    font-size: 12px;
    color: #999;
    margin-bottom: 12px;
  }
}

.hidden-input {
  display: none;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e8f4fc;
  border-radius: 6px;

  &__icon {
    font-size: 20px;
    color: #1e6bb8;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 13px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    font-size: 11px;
    color: #999;
  }
}

.file-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 0;
  color: #bbb;
  font-size: 12px;

  .el-icon {
    font-size: 28px;
  }
}

// transition
.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.2s ease;
}

.file-list-enter-from,
.file-list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>