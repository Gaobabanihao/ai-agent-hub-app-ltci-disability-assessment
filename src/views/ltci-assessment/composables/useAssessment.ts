import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import type {
  AssessmentItem,
  AssessmentRecord,
  BasicInfo,
  FileInfo,
  FileUploadType,
  SelfAssessmentData,
} from '../types';
import {
  createAssessmentDraft,
  createInsuredPerson,
  deleteUploadedFile,
  generateAiSuggestion,
  getAiSuggestion,
  getInsuredPersonList,
  submitAssessmentResult,
  uploadAndParseSelfAssessment,
  uploadMedicalFile,
  uploadVideoFile,
} from '@/api/ltci-assessment';
import type {
  AiSuggestionResult,
  InsuredPerson,
  ParsedSelfAssessment,
  SaveAssessmentPayload,
  SubmitAssessmentPayload,
  SubmittedAssessment,
} from '@/api/ltci-assessment';
import { ASSESSMENT_CATEGORIES } from '../constants/assessment-data';
import { useScoring } from './useScoring';

const SELF_ASSESSMENT_KEYS = [
  'eat',
  'wash',
  'dress',
  'toilet',
  'move',
  'memory',
  'orientation',
  'emotion',
  'social',
  'vision',
  'language',
] as const;

// 兼容历史记录里仍使用中文 key 的自评数据。
const LEGACY_SELF_ASSESSMENT_KEY_MAP: Record<string, string> = {
  进食: 'eat',
  洗漱: 'wash',
  穿衣: 'dress',
  如厕: 'toilet',
  移动: 'move',
  记忆力: 'memory',
  定向力: 'orientation',
  情绪稳定性: 'emotion',
  社交能力: 'social',
  视觉: 'vision',
  语言表达: 'language',
};

const ITEM_CATEGORY_MAP = ASSESSMENT_CATEGORIES.reduce<Record<string, number>>((acc, category, index) => {
  category.items.forEach((item) => {
    acc[item.id] = index + 1;
  });
  return acc;
}, {});

function createInitialAssessmentItems(): AssessmentItem[] {
  return ASSESSMENT_CATEGORIES.flatMap((category, categoryIndex) =>
    category.items.map((item) => ({
      category: category.name,
      categoryId: categoryIndex + 1,
      itemId: item.id,
      item: item.name,
      selfItem: item.selfItem,
      grade: null,
      note: '',
    })),
  );
}

const currentStep = ref(1);

const basicInfo = reactive<BasicInfo>({
  insureeName: '',
  idCard: '',
  phone: '',
  insuranceArea: '',
  assessmentDate: '',
  assessor: '',
});

const files = reactive<Record<FileUploadType, FileInfo[]>>({
  selfAssessment: [],
  medical: [],
  video: [],
});

const selfAssessmentData = reactive<SelfAssessmentData>({});
const assessmentItems = reactive<AssessmentItem[]>(createInitialAssessmentItems());

const insuredPersonId = ref<number | null>(null);
const assessmentId = ref<number | null>(null);
const submittedAssessment = ref<SubmittedAssessment | null>(null);
const aiSuggestion = ref<AiSuggestionResult | null>(null);
const aiSuggestionLoading = ref(false);

// 防止并发点击造成重复创建被保险人/评估草稿。
let ensureDraftPromise: Promise<number> | null = null;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function toDisplayTime(isoTime?: string): string {
  if (!isoTime) return new Date().toLocaleString('zh-CN');
  return new Date(isoTime).toLocaleString('zh-CN');
}

function isImageFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png'].includes(ext || '');
}

function toFileInfo(file: File, payload: {
  id?: number;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
}): FileInfo {
  const rawSize = payload.fileSize ?? file.size;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    backendId: payload.id,
    name: payload.fileName || file.name,
    size: formatFileSize(rawSize),
    rawSize,
    time: toDisplayTime(payload.uploadedAt),
    file,
  };
}

function applyParsedSelfAssessment(data: ParsedSelfAssessment) {
  SELF_ASSESSMENT_KEYS.forEach((key) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      selfAssessmentData[key] = String(value);
    }
  });
}

function normalizeSelfAssessmentData(data: SelfAssessmentData): SelfAssessmentData {
  const normalized: SelfAssessmentData = {};
  Object.entries(data).forEach(([key, value]) => {
    const normalizedKey = LEGACY_SELF_ASSESSMENT_KEY_MAP[key] || key;
    normalized[normalizedKey] = value;
  });
  return normalized;
}

function applyInsuredPersonSnapshot(insuredPerson: InsuredPerson) {
  if (!basicInfo.insureeName) {
    basicInfo.insureeName = insuredPerson.name;
  }
  if (!basicInfo.phone && insuredPerson.phone) {
    basicInfo.phone = insuredPerson.phone;
  }
  if (!basicInfo.insuranceArea && insuredPerson.insuranceArea) {
    basicInfo.insuranceArea = insuredPerson.insuranceArea;
  }
  if (!basicInfo.assessor && insuredPerson.assessor) {
    basicInfo.assessor = insuredPerson.assessor;
  }
}

function resetDraftState() {
  insuredPersonId.value = null;
  assessmentId.value = null;
  submittedAssessment.value = null;
  aiSuggestion.value = null;
  ensureDraftPromise = null;
}

function toSubmitItems(): SubmitAssessmentPayload['items'] {
  const result: SubmitAssessmentPayload['items'] = [];

  assessmentItems
    .filter((item) => item.grade !== null)
    .forEach((item) => {
      const grade = Number.parseInt(item.grade || '', 10);
      if (Number.isNaN(grade)) {
        return;
      }

      const category =
        typeof item.categoryId === 'number'
          ? item.categoryId
          : (ITEM_CATEGORY_MAP[item.itemId] || 0);

      if (category <= 0) {
        return;
      }

      const selfGradeRaw = selfAssessmentData[item.selfItem];
      const parsedSelfGrade = selfGradeRaw === undefined ? NaN : Number.parseInt(selfGradeRaw, 10);
      const selfGrade = Number.isNaN(parsedSelfGrade) ? undefined : parsedSelfGrade;

      result.push({
        category,
        itemCode: item.itemId,
        itemName: item.item,
        grade,
        selfGrade,
        assessmentNote: item.note || undefined,
      });
    });

  return result;
}

export function useAssessment() {
  const isInfoComplete = computed(
    () =>
      !!(
        basicInfo.insureeName &&
        basicInfo.idCard &&
        basicInfo.assessmentDate &&
        basicInfo.assessor
      ),
  );

  const hasAnyGrade = computed(() => assessmentItems.some((item) => item.grade !== null));

  function setStep(step: number) {
    currentStep.value = step;
  }

  function advanceStep(step: number) {
    if (step > currentStep.value) {
      currentStep.value = step;
    }
  }

  function updateGrade(itemId: string, grade: string | null) {
    const item = assessmentItems.find((i) => i.itemId === itemId);
    if (item) {
      item.grade = grade;
      advanceStep(3);
    }
  }

  function updateNote(itemId: string, note: string) {
    const item = assessmentItems.find((i) => i.itemId === itemId);
    if (item) item.note = note;
  }

  const idCardPattern = /^\d{17}[\dXx]$/;

  function validateBasicInfo(): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    if (!basicInfo.insureeName) errors.insureeName = '请填写被保险人姓名';
    if (!basicInfo.idCard) {
      errors.idCard = '请填写身份证号';
    } else if (!idCardPattern.test(basicInfo.idCard)) {
      errors.idCard = '身份证号格式不正确';
    }
    if (!basicInfo.assessmentDate) errors.assessmentDate = '请选择评估日期';
    if (!basicInfo.assessor) errors.assessor = '请填写评估人员姓名';
    return { valid: Object.keys(errors).length === 0, errors };
  }

  async function ensureAssessmentDraft(): Promise<number> {
    if (assessmentId.value) {
      return assessmentId.value;
    }
    if (ensureDraftPromise) {
      return ensureDraftPromise;
    }

    ensureDraftPromise = (async () => {
      const { valid, errors } = validateBasicInfo();
      if (!valid) {
        throw new Error(Object.values(errors)[0] || '请先完善被保险人基本信息');
      }

      const insuredList = await getInsuredPersonList();
      let insured = insuredList.find((item) => item.idCard === basicInfo.idCard);
      if (!insured) {
        insured = await createInsuredPerson({
          name: basicInfo.insureeName,
          idCard: basicInfo.idCard,
          phone: basicInfo.phone || undefined,
          insuranceArea: basicInfo.insuranceArea || undefined,
          assessor: basicInfo.assessor || undefined,
        });
      } else {
        applyInsuredPersonSnapshot(insured);
      }
      insuredPersonId.value = insured.id;

      const draft = await createAssessmentDraft({
        insuredPersonId: insured.id,
        idCard: basicInfo.idCard,
        name: basicInfo.insureeName,
        assessmentDate: basicInfo.assessmentDate,
        assessor: basicInfo.assessor,
      });
      assessmentId.value = draft.id;
      return draft.id;
    })().finally(() => {
      ensureDraftPromise = null;
    });

    return ensureDraftPromise;
  }

  async function addFiles(type: FileUploadType, newFiles: File[]) {
    if (!newFiles.length) return;
    const draftId = await ensureAssessmentDraft();
    const uploadedFiles: FileInfo[] = [];

    for (const file of newFiles) {
      if (type === 'selfAssessment') {
        if (!isImageFile(file)) {
          throw new Error('客户自评表仅支持 JPG、JPEG、PNG 图片，并会在上传后自动 OCR 解析');
        }

        const parsed = await uploadAndParseSelfAssessment(draftId, file);
        applyParsedSelfAssessment(parsed.selfAssessment);
        uploadedFiles.push(
          toFileInfo(file, {
            id: parsed.file.id,
            fileName: parsed.file.fileName,
          }),
        );
        continue;
      }

      if (type === 'medical') {
        const uploaded = await uploadMedicalFile(draftId, file);
        uploadedFiles.push(
          toFileInfo(file, {
            id: uploaded.file.id,
            fileName: uploaded.file.fileName,
            fileSize: uploaded.file.fileSize,
            uploadedAt: uploaded.file.uploadedAt,
          }),
        );
        continue;
      }

      const uploaded = await uploadVideoFile(draftId, file);
      uploadedFiles.push(
        toFileInfo(file, {
          id: uploaded.id,
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
          uploadedAt: uploaded.uploadedAt,
        }),
      );
    }

    files[type].push(...uploadedFiles);
    advanceStep(2);
  }

  async function removeFile(type: FileUploadType, id: string) {
    const idx = files[type].findIndex((f) => f.id === id);
    if (idx === -1) {
      return;
    }

    const target = files[type][idx];
    if (!target) {
      return;
    }
    if (target.backendId) {
      await deleteUploadedFile(target.backendId);
    }
    files[type].splice(idx, 1);

    if (type === 'selfAssessment' && files.selfAssessment.length === 0) {
      Object.keys(selfAssessmentData).forEach((key) => delete selfAssessmentData[key]);
    }
  }

  function buildSubmitPayload(): SubmitAssessmentPayload {
    return {
      items: toSubmitItems(),
    };
  }

  async function submitCurrentAssessment() {
    const draftId = await ensureAssessmentDraft();
    const payload = buildSubmitPayload();
    const requiredCount = assessmentItems.length;
    // 文档要求提交全部 11 项打分，这里做前端硬校验。
    if (payload.items.length !== requiredCount) {
      throw new Error(`请先完成全部 ${requiredCount} 项评估后再提交`);
    }
    submittedAssessment.value = await submitAssessmentResult(draftId, payload);
    return submittedAssessment.value;
  }

  async function generateCurrentAiSuggestion() {
    const draftId = await ensureAssessmentDraft();
    const selfAssessmentFile = files.selfAssessment[0]?.file;
    const medicalFile = files.medical[0]?.file;
    const videoFile = files.video[0]?.file;

    if (!selfAssessmentFile) {
      throw new Error('请先上传客户自评表后再生成 AI 建议');
    }
    if (!medicalFile) {
      throw new Error('请先上传医疗材料后再生成 AI 建议');
    }

    aiSuggestionLoading.value = true;
    try {
      aiSuggestion.value = await generateAiSuggestion(draftId, selfAssessmentFile, medicalFile, videoFile);
      return aiSuggestion.value;
    } finally {
      aiSuggestionLoading.value = false;
    }
  }

  async function fetchCurrentAiSuggestion() {
    const draftId = await ensureAssessmentDraft();
    aiSuggestionLoading.value = true;
    try {
      aiSuggestion.value = await getAiSuggestion(draftId);
      return aiSuggestion.value;
    } finally {
      aiSuggestionLoading.value = false;
    }
  }

  function buildSavePayload(): SaveAssessmentPayload {
    const { calculateResult } = useScoring(assessmentItems, files, selfAssessmentData);
    const result = calculateResult();
    const submitted = submittedAssessment.value;
    return {
      assessmentId: assessmentId.value || undefined,
      basicInfo: { ...basicInfo },
      assessmentItems: assessmentItems.map((i) => ({ ...i })),
      selfAssessmentData: { ...selfAssessmentData },
      filesInfo: {
        selfAssessment: files.selfAssessment.map(({ id, name, size, time }) => ({ id, name, size, time })),
        medical: files.medical.map(({ id, name, size, time }) => ({ id, name, size, time })),
        video: files.video.map(({ id, name, size, time }) => ({ id, name, size, time })),
      },
      avgGrade: submitted?.finalScore ?? result.avgGrade,
      disabilityLevel: submitted?.finalGrade ?? result.disabilityLevel,
      gradedCount: submitted?.itemCount ?? result.gradedCount,
      status: submitted?.status,
      submitTime: submitted?.submitTime,
    };
  }

  function restoreFromRecord(record: AssessmentRecord) {
    Object.assign(basicInfo, {
      insureeName: record.insureeName,
      idCard: record.idCard,
      phone: record.phone,
      insuranceArea: record.insuranceArea,
      assessmentDate: record.assessmentDate,
      assessor: record.assessor,
    });
    resetDraftState();

    assessmentItems.forEach((item) => {
      item.grade = null;
      item.note = '';
    });

    record.assessmentItems.forEach((saved) => {
      const item = assessmentItems.find((i) => i.itemId === saved.itemId);
      if (item) {
        item.grade = saved.grade;
        item.note = saved.note;
      }
    });

    Object.keys(selfAssessmentData).forEach((k) => delete selfAssessmentData[k]);
    Object.assign(selfAssessmentData, normalizeSelfAssessmentData(record.selfAssessmentData));
    assessmentId.value = record.assessmentId ?? null;
    submittedAssessment.value = record.assessmentId
      ? {
          id: record.assessmentId,
          insuredPersonId: insuredPersonId.value || 0,
          idCard: record.idCard,
          assessmentDate: record.assessmentDate,
          assessor: record.assessor,
          finalGrade: record.disabilityLevel,
          finalScore: record.avgGrade,
          itemCount: record.gradedCount,
          status: record.status ?? 1,
          submitTime: record.submitTime || record.createdAt,
        }
      : null;
    aiSuggestion.value = null;

    files.selfAssessment.splice(0);
    files.medical.splice(0);
    files.video.splice(0);

    const totalFiles =
      record.filesInfo.selfAssessment.length +
      record.filesInfo.medical.length +
      record.filesInfo.video.length;
    if (totalFiles > 0) {
      ElMessage.warning('文件附件无法恢复，请重新上传相关材料');
    }

    advanceStep(3);
  }

  return {
    currentStep,
    basicInfo,
    files,
    selfAssessmentData,
    assessmentItems,
    assessmentId,
    submittedAssessment,
    aiSuggestion,
    aiSuggestionLoading,
    isInfoComplete,
    hasAnyGrade,
    setStep,
    advanceStep,
    ensureAssessmentDraft,
    addFiles,
    removeFile,
    updateGrade,
    updateNote,
    validateBasicInfo,
    buildSubmitPayload,
    submitCurrentAssessment,
    generateCurrentAiSuggestion,
    fetchCurrentAiSuggestion,
    buildSavePayload,
    restoreFromRecord,
  };
}
