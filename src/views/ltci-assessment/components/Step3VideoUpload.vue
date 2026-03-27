<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAssessment } from '../composables/useAssessment';
import type { FileInfo, FileUploadType } from '../types';

defineOptions({ name: 'Step3VideoUpload' });

const { files, addFiles, removeFile, generateCurrentAiSuggestion } = useAssessment();

const fileInputRef = ref<HTMLInputElement | null>(null);
const asrText = ref('');
const uploadParsing = ref(false);

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
  fileInputRef.value?.click();
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

async function handleUploadParsing() {
  if (!asrText.value.trim()) {
    ElMessage.warning('请输入音视频转译文本');
    return;
  }
  
  uploadParsing.value = true;
  try {
    // 调用与音视频下方的生成AI建议相同的接口，但传参为asrText
    await generateCurrentAiSuggestion(3, asrText.value);
    ElMessage.success('上传解析成功');
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传解析失败';
    ElMessage.error(message);
  } finally {
    uploadParsing.value = false;
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
    <div class="card-header-new">
      <h2>音视频材料上传</h2>
    </div>

    <div class="upload-sections">
      <!-- 音视频材料上传 -->
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
            ref="fileInputRef"
            type="file"
            accept=".mp4,.mp3,.avi,.mov,.wav,.ogg,.m4a"
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

      <!-- 音视频转译文本录入 -->
      <div class="upload-section">
        <div class="upload-section__head">
          <div class="upload-section__title">
            <el-icon><Document /></el-icon>
            <span>音视频转译文本</span>
          </div>
        </div>

        <p class="upload-section__desc">请输入音视频转译后的文本内容</p>

        <el-input
          v-model="asrText"
          type="textarea"
          :rows="6"
          placeholder="请输入音视频转译文本"
          class="asr-text-input"
        />

        <div class="upload-section__footer">
          <el-button
            type="primary"
            :loading="uploadParsing"
            @click="handleUploadParsing"
          >
            <!-- <el-icon><Upload /></el-icon> -->
            上传解析
          </el-button>
        </div>
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

.card-header-new {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: #f0f9eb;
  color: #67c23a;

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
}

.upload-sections {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background-color: #f0f7ff;
  padding: 20px;
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.upload-section {
  background: #fff;
  border: 1px solid #e8f4fc;
  border-radius: 6px;
  padding: 16px;

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

  &__footer {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
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

.asr-text-input {
  width: 100%;
  margin-bottom: 12px;
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