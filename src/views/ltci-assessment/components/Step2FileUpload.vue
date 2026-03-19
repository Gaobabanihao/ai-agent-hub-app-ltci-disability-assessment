<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAssessment } from '../composables/useAssessment';
import type { FileInfo, FileUploadType } from '../types';

defineOptions({ name: 'Step2FileUpload' });

const { files, addFiles, removeFile } = useAssessment();

interface UploadSection {
  key: FileUploadType;
  title: string;
  icon: string;
  accept: string;
  desc: string;
}

const uploadSections: UploadSection[] = [
  {
    key: 'selfAssessment',
    title: '客户自评表',
    icon: 'Document',
    accept: '.jpg,.jpeg,.png',
    desc: '支持 JPG、PNG，上传后自动 OCR 解析',
  },
  {
    key: 'medical',
    title: '医疗材料',
    icon: 'FirstAidKit',
    accept: '.pdf,.jpg,.jpeg,.png',
    desc: '支持 PDF、JPG、PNG',
  },
];

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

function triggerUpload(key: FileUploadType) {
  fileInputRefs.value[key]?.click();
}

async function handleFileChange(event: Event, key: FileUploadType) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  uploadLoading[key] = true;
  try {
    await addFiles(key, Array.from(input.files));
    ElMessage.success('文件上传成功');
  } catch (error) {
    const message = error instanceof Error ? error.message : '文件上传失败';
    ElMessage.error(message);
  } finally {
    uploadLoading[key] = false;
    input.value = '';
  }
}

async function handleDelete(key: FileUploadType, id: string) {
  deleteLoading[key] = true;
  try {
    await removeFile(key, id);
    ElMessage.success('文件已删除');
  } catch (error) {
    const message = error instanceof Error ? error.message : '文件删除失败';
    ElMessage.error(message);
  } finally {
    deleteLoading[key] = false;
  }
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'Picture';
  if (['doc', 'docx'].includes(ext)) return 'Document';
  if (['pdf'].includes(ext)) return 'Document';
  return 'Files';
}
</script>

<template>
  <div class="upload-card">
    <div class="card-header-new">
      <h2>文件材料上传</h2>
    </div>

    <div class="upload-sections">
      <div
        v-for="section in uploadSections"
        :key="section.key"
        class="upload-section"
      >
        <div class="upload-section__head">
          <div class="upload-section__title">
            <el-icon><component :is="section.icon" /></el-icon>
            <span>{{ section.title }}</span>
          </div>
          <el-button
            type="primary"
            size="small"
            plain
            :loading="uploadLoading[section.key]"
            @click="triggerUpload(section.key)"
          >
            <el-icon><Plus /></el-icon>
            上传文件
          </el-button>
          <input
            :ref="(el) => (fileInputRefs[section.key] = el as HTMLInputElement)"
            type="file"
            :accept="section.accept"
            multiple
            class="hidden-input"
            @change="(e) => handleFileChange(e, section.key)"
          />
        </div>

        <p class="upload-section__desc">{{ section.desc }}</p>

        <transition-group
          name="file-list"
          tag="div"
          class="file-list"
        >
          <div
            v-for="file in (files[section.key] as FileInfo[])"
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
              :loading="deleteLoading[section.key]"
              @click="handleDelete(section.key, file.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </transition-group>

        <div
          v-if="!(files[section.key] as FileInfo[]).length"
          class="file-empty"
        >
          <el-icon><FolderOpened /></el-icon>
          <span>暂无上传文件</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.upload-card {
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
