<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useAssessment } from '../composables/useAssessment';
import { useScoring, type AISuggestion } from '../composables/useScoring';
import { ASSESSMENT_CATEGORIES, SELF_ASSESSMENT_MAPPING } from '../constants/assessment-data';

defineOptions({ name: 'Step3AssessmentEntry' });

const { files, selfAssessmentData, assessmentItems, updateGrade, updateNote, aiSuggestion } = useAssessment();
const { generateAISuggestion } = useScoring(assessmentItems, files, selfAssessmentData);

// Per-item AI suggestion cache (keyed by itemId)
const aiSuggestions = reactive<Record<string, AISuggestion>>({
});

// 解析AI建议中的ADL雷达数据
const adlRadarData = computed(() => {
  if (!aiSuggestion.value?.suggestion) return {};
  try {
    const suggestion = JSON.parse(aiSuggestion.value.suggestion);
    const adlRadar = suggestion['智能评估结果摘要']?.['ADL雷达'] || [];
    const adlMap: Record<string, { 评估: string; 依据: string }> = {};
    adlRadar.forEach((item: any) => {
      adlMap[item.项目] = {
        评估: item.评估,
        依据: item.依据
      };
    });
    return adlMap;
  } catch {
    return {};
  }
});

function getItem(itemId: string) {
  return assessmentItems.find((i) => i.itemId === itemId)!;
}

function getSelfAssessmentText(selfItem: string): string {
  const grade = selfAssessmentData[selfItem];
  if (grade === undefined) return '';
  const desc = SELF_ASSESSMENT_MAPPING[selfItem]?.[grade] ?? '';
  return `${grade} 级 — ${desc}`;
}

function onGradeChange(itemId: string, grade: string | null) {
  updateGrade(itemId, grade);
  if (grade !== null) {
    const item = getItem(itemId);
    aiSuggestions[itemId] = generateAISuggestion(item.item, grade, item.selfItem);
  } else {
    delete aiSuggestions[itemId];
  }
}

function onNoteInput(itemId: string, note: string) {
  updateNote(itemId, note);
}
</script>

<template>
  <div class="assessment-card">
    <div class="card-header-new">
      <el-icon class="card-header__icon">
        <EditPen />
      </el-icon>
      <h2>失能等级评估录入</h2>
    </div>

    <div class="assessment-body">
      <div v-for="category in ASSESSMENT_CATEGORIES" :key="category.id" class="category-block">
        <!-- 类别标题 -->
        <div class="category-header">
          <span class="category-header__number">{{ category.number }}</span>
          <h3 class="category-header__title">{{ category.name }}</h3>
          <span class="category-header__standard">{{ category.standardDesc }}</span>
        </div>

        <!-- 评估项目 -->
        <div v-for="itemDef in category.items" :key="itemDef.id" class="assessment-item">
          <div class="assessment-item__title">
            <span class="assessment-item__number">{{ itemDef.number }}</span>
            <h4>{{ itemDef.name }}</h4>
          </div>

          <div class="assessment-item__body">
            <!-- 客户自评结论（上传自评表后显示） -->
            <!-- <div v-if="selfAssessmentData[itemDef.selfItem] !== undefined" class="self-assessment-box">
              <div class="self-assessment-box__label">
                <el-icon>
                  <User />
                </el-icon>
                客户自评结论
              </div>
              <div class="self-assessment-box__content">
                {{ getSelfAssessmentText(itemDef.selfItem) }}
              </div>
            </div> -->
            <transition name="fade">
              <div class="ai-suggestion-panel">
                <div class="ai-suggestion-panel__title">
                  <el-icon>
                    <MagicStick />
                  </el-icon>
                  材料参考建议
                </div>
                <!-- 自评结果 -->
                <div v-if="selfAssessmentData[itemDef.selfItem] !== undefined" class="ai-suggestion-panel__section">
                  <span class="ai-suggestion-panel__tag ai-suggestion-panel__tag--self">
                    自评
                  </span>
                  <p>客户自评{{ itemDef.name }}为 {{ selfAssessmentData[itemDef.selfItem] }} 级</p>
                </div>
                <!-- 医疗材料建议 -->
                <div class="ai-suggestion-panel__section">
                  <span class="ai-suggestion-panel__tag ai-suggestion-panel__tag--medical">
                    医疗材料
                  </span>
                  <div>
                    <p v-if="files.medical.length > 0">已上传 {{ files.medical.length }} 份医疗材料</p>
                    <p v-else>暂无医疗材料</p>
                    <!-- AI建议 -->
                    <p v-if="adlRadarData[itemDef.name]" >
                      {{ adlRadarData[itemDef.name]?.依据 }}
                      <span v-if="adlRadarData[itemDef.name]?.评估 !== '未知'"> {{ adlRadarData[itemDef.name]?.评估 }}</span>
                    </p>
                  </div>
                </div>

                <!-- 音视频建议 -->
                <div class="ai-suggestion-panel__section">
                  <span class="ai-suggestion-panel__tag ai-suggestion-panel__tag--video">
                    音视频
                  </span>
                  <p v-if="files.video.length > 0">已上传 {{ files.video.length }} 份音视频材料</p>
                  <p v-else>暂无音视频材料</p>
                </div>

                <!-- 自评对比（仅在有自评数据时显示） -->

              </div>
            </transition>
            <!-- 评估等级选择 -->
            <div class="grade-row">
              <label class="grade-row__label">评估等级</label>
              <el-select :model-value="getItem(itemDef.id).grade" placeholder="请选择评估等级" clearable style="width: 260px"
                @update:model-value="(val) => onGradeChange(itemDef.id, val)">
                <el-option v-for="opt in category.gradeOptions" :key="opt.value" :label="opt.label"
                  :value="opt.value" />
              </el-select>
            </div>

            <!-- 材料参考建议（三段式，本地辅助提示） -->


            <!-- 评估意见 -->
            <div class="note-area">
              <label class="note-area__label">评估意见</label>
              <el-input type="textarea" :rows="2" :model-value="getItem(itemDef.id).note" placeholder="请录入本项评估意见..."
                @update:model-value="(val) => onNoteInput(itemDef.id, val)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.assessment-card {
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

.assessment-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// ── 类别块 ───────────────────────────────────────────────────────────────────

.category-block {
  border: 1px solid #e8f4fc;
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f0f7ff;
  border-bottom: 1px solid #e8f4fc;

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #1e6bb8;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #1e6bb8;
    margin: 0;
  }

  &__standard {
    font-size: 12px;
    color: #888;
    margin-left: auto;

    @media (max-width: 768px) {
      display: none;
    }
  }
}

// ── 评估项 ───────────────────────────────────────────────────────────────────

.assessment-item {
  padding: 16px;
  border-bottom: 1px solid #f0f7ff;

  &:last-child {
    border-bottom: none;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
  }

  &__number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 20px;
    padding: 0 6px;
    background: #e8f4fc;
    color: #1e6bb8;
    font-size: 11px;
    font-weight: 600;
    border-radius: 10px;
    flex-shrink: 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-left: 40px;

    @media (max-width: 768px) {
      padding-left: 0;
    }
  }
}

// ── 客户自评框 ───────────────────────────────────────────────────────────────

.self-assessment-box {
  border-left: 3px solid #28a745;
  background: #f9fdf7;
  border-radius: 0 6px 6px 0;
  padding: 10px 14px;

  &__label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: #28a745;
    margin-bottom: 6px;
  }

  &__content {
    font-size: 13px;
    color: #555;
  }
}

// ── 等级选择行 ───────────────────────────────────────────────────────────────

.grade-row {
  display: flex;
  align-items: center;
  gap: 12px;

  &__label {
    font-size: 13px;
    color: #555;
    font-weight: 500;
    white-space: nowrap;
  }
}

// ── AI 建议面板（三段式） ────────────────────────────────────────────────────

.ai-suggestion-panel {
  border-left: 3px solid #1e6bb8;
  background: #f0f7ff;
  border-radius: 0 6px 6px 0;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__title {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: #1e6bb8;
    padding-bottom: 8px;
    border-bottom: 1px dashed #cce3f8;
  }

  &__section {
    display: flex;
    align-items: flex-start;
    gap: 8px;

    p {
      font-size: 13px;
      color: #444;
      line-height: 1.7;
      margin: 0;
    }
  }

  &__tag {
    flex-shrink: 0;
    display: inline-block;
    padding: 1px 7px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    margin-top: 2px;

    &--medical {
      background: #e8f4fc;
      color: #1e6bb8;
    }

    &--video {
      background: #fdf0e8;
      color: #d07020;
    }

    &--self {
      background: #edf7ed;
      color: #28a745;
    }

    &__tag--ai {
      background: #f0e6ff;
      color: #8a2be2;
    }
  }

  .ai-suggestion-text {
    font-size: 13px;
    color: #666;
    line-height: 1.7;
    margin: 8px 0 0 0;
    padding-left: 10px;
    border-left: 2px solid #8a2be2;
  }
}

// ── 评估意见 ─────────────────────────────────────────────────────────────────

.note-area {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    font-size: 13px;
    color: #555;
    font-weight: 500;
  }
}

// ── 过渡动画 ─────────────────────────────────────────────────────────────────

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
