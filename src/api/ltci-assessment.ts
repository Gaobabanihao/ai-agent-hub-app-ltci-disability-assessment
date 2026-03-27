import { del, get, post, postForm } from '@/utils/requests';
import type {
  AssessmentItem,
  AssessmentRecord,
  DisabilityLevel,
  FileMetaInfo,
  HistoryListParams,
  SelfAssessmentData,
} from '@/views/ltci-assessment/types';

/** 长护险评估正式接口基础路径。 */
export const BASE_URL = '/ltci-api';

/**
 * 历史记录列表接口通用分页数据结构。
 *
 * 当前仅用于历史模块兼容接口。
 */
export interface PaginatedData<T> {
  /** 当前页数据列表。 */
  list: T[];
  /** 数据总条数。 */
  total: number;
  /** 当前页码。 */
  page: number;
  /** 每页条数。 */
  pageSize: number;
}

/** 创建被保险人请求参数。 */
export interface CreateInsuredPersonPayload {
  /** 被保险人姓名。 */
  name: string;
  /** 身份证号。 */
  idCard: string;
  /** 联系电话。 */
  phone?: string;
  /** 参保地。 */
  insuranceArea?: string;
  /** 评估人员。 */
  assessor?: string;
}

/** 被保险人信息。 */
export interface InsuredPerson {
  /** 被保险人 ID。 */
  id: number;
  /** 被保险人姓名。 */
  name: string;
  /** 身份证号。 */
  idCard: string;
  /** 联系电话。 */
  phone?: string;
  /** 参保地。 */
  insuranceArea?: string;
  /** 评估人员。 */
  assessor?: string;
  /** 创建时间。 */
  createdAt: string;
  /** 更新时间。 */
  updatedAt: string;
}

/** 创建评估草稿请求参数。 */
export interface CreateAssessmentDraftPayload {
  /** 被保险人 ID。 */
  insuredPersonId: number;
  /** 身份证号。 */
  idCard: string;
  /** 评估日期，格式通常为 `YYYY-MM-DD`。 */
  assessmentDate: string;
  /** 评估人员。 */
  assessor: string;
  /** 被保险人姓名，最新版接口文档已新增并要求必填。 */
  name: string;
}

/** 评估草稿信息。 */
export interface AssessmentDraft {
  /** 评估草稿 ID。 */
  id: number;
  /** 被保险人 ID。 */
  insuredPersonId: number;
  /** 身份证号。 */
  idCard: string;
  /** 被保险人姓名。 */
  name: string;
  /** 评估日期。 */
  assessmentDate: string;
  /** 评估人员。 */
  assessor: string;
  /** 评估状态，示例值 `0` 表示草稿。 */
  status: number;
  /** 创建时间。 */
  createdAt: string;
}

/** 单个评估项目提交参数。 */
export interface SubmitAssessmentItem {
  /** 评估类别：`1` 日常生活、`2` 认知、`3` 情绪、`4` 感知觉。 */
  category: number;
  /** 项目代码，如 `eat`、`memory`、`vision`。 */
  itemCode: string;
  /** 项目名称，如“进食”“记忆力”。 */
  itemName: string;
  /** 评定等级，具体取值含义见接口文档 11 项代码对照表。 */
  grade: number;
  /** 客户自评等级。 */
  selfGrade?: number;
  /** 评估意见。 */
  assessmentNote?: string;
}

/** 提交评估结果请求参数。 */
export interface SubmitAssessmentPayload {
  /** 评估项目列表，通常为 11 项。 */
  items: SubmitAssessmentItem[];
}

/** 提交评估结果后的返回数据。 */
export interface SubmittedAssessment {
  /** 评估记录 ID。 */
  id: number;
  /** 被保险人 ID。 */
  insuredPersonId: number;
  /** 身份证号。 */
  idCard: string;
  /** 评估日期。 */
  assessmentDate: string;
  /** 评估人员。 */
  assessor: string;
  /** 后端自动计算出的失能等级。 */
  finalGrade: string;
  /** 后端自动计算出的综合得分。 */
  finalScore: number;
  /** 已提交的评估项目数量。 */
  itemCount: number;
  /** 评估状态，示例值 `1` 表示已提交。 */
  status: number;
  /** 提交时间。 */
  submitTime: string;
}

/** 上传文件后的返回数据。 */
export interface UploadedFile {
  /** 文件 ID。 */
  id: number;
  /** 所属评估记录 ID。 */
  assessmentId: number;
  /** 文件类型编码，具体值由后端定义。 */
  fileType: number;
  /** 文件名称。 */
  fileName: string;
  /** 文件存储路径，查询文件列表和部分上传接口会返回。 */
  filePath?: string;
  /** 文件大小，单位为字节。 */
  fileSize: number;
  /** 上传时间。 */
  uploadedAt: string;
}

/** OCR 解析后的自评表结构化结果。 */
export interface ParsedSelfAssessment {
  /** 进食自评等级。 */
  eat?: number;
  /** 洗漱自评等级。 */
  wash?: number;
  /** 穿衣自评等级。 */
  dress?: number;
  /** 如厕自评等级。 */
  toilet?: number;
  /** 移动自评等级。 */
  move?: number;
  /** 记忆力自评等级。 */
  memory?: number;
  /** 定向力自评等级。 */
  orientation?: number;
  /** 情绪稳定性自评等级。 */
  emotion?: number;
  /** 社交能力自评等级。 */
  social?: number;
  /** 视觉自评等级。 */
  vision?: number;
  /** 语言表达自评等级。 */
  language?: number;
  /** OCR 识别出的自评等级，如 `E级`。 */
  selfGrade?: string;
}

/** 上传并解析自评表后的返回数据。 */
export interface ParseSelfAssessmentResult {
  /** 上传后的文件信息。 */
  file: {
    /** 文件 ID。 */
    id: number;
    /** 文件名称。 */
    fileName: string;
  };
  /** OCR 解析后的自评表结构化数据。 */
  selfAssessment: ParsedSelfAssessment;
}

/** 上传医疗资料并返回 OCR 识别结果（支持多文件）。 */
export interface UploadMedicalFileResult {
  /** 上传后的文件列表，后端返回 `files` 数组。 */
  files: Array<{ file: UploadedFile }>;
  /** OCR 识别出的原始文本（可选）。 */
  ocrText?: string;
  /** OCR 文本长度（可选）。 */
  ocrLength?: number;
}

/** 评估明细主表信息。 */
export interface AssessmentDetail {
  /** 评估记录 ID。 */
  id: number;
  /** 被保险人 ID。 */
  insuredPersonId: number;
  /** 身份证号。 */
  idCard: string;
  /** 被保险人姓名。 */
  name: string;
  /** 评估日期。 */
  assessmentDate: string;
  /** 评估人员。 */
  assessor: string;
  /** 失能等级。 */
  finalGrade: string;
  /** 综合得分。 */
  finalScore: number;
  /** 评估状态：`0` 草稿、`1` 已提交、`2` 已确认。 */
  status: number;
  /** 提交时间。 */
  submitTime: string;
  /** 评估项数。 */
  itemCount: number;
  /** 创建时间。 */
  createdAt: string;
  /** 更新时间。 */
  updatedAt: string;
}

/** 评估明细中的单个项目。 */
export interface AssessmentDetailItem {
  /** 项目 ID。 */
  id: number;
  /** 评估记录 ID。 */
  assessmentId: number;
  /** 评估类别：`1` 日常生活、`2` 认知、`3` 情绪、`4` 感知觉。 */
  category: number;
  /** 项目代码。 */
  itemCode: string;
  /** 项目名称。 */
  itemName: string;
  /** 评定等级。 */
  grade: number;
  /** 自评等级。 */
  selfGrade?: number;
  /** 评估意见。 */
  assessmentNote?: string;
}

/** 获取评估详情返回数据。 */
export interface AssessmentDetailResult {
  /** 评估主表信息。 */
  assessment: AssessmentDetail;
  /** 评估项目列表。 */
  items: AssessmentDetailItem[];
  /** 自评表结构化提取结果。 */
  structExtract?: any;
  /** 医疗材料AI建议结果。 */
  aiSuggestion?: any;
  /** 音视频处理结果。 */
  inProcess?: any;
}

/** AI 建议结果数据。 */
export interface AiSuggestionResult {
  /** 是否成功生成建议。 */
  success: boolean;
  /** AI 建议内容，后端返回 JSON 字符串。 */
  suggestion: string;
  /** 模型结束原因。 */
  finishReason: string | null;
  /** 输入 token 数。 */
  promptTokens: number;
  /** 输出 token 数。 */
  completionTokens: number;
  /** 总 token 数。 */
  totalTokens: number;
  /** 错误信息。 */
  errorMessage: string | null;
  /** 建议生成时间。 */
  createTime: string;
}

/** 构造文件上传请求体（单文件）。 */
function createFileFormData(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

/** 构造文件上传请求体（多文件）。
 *
 * 后端通常会通过多个同名 `files` 字段接收多个文件。
 */
function createFilesFormData(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  return formData;
}

/** 构造 AI 建议生成接口的上传请求体。 */
function createAiSuggestionFormData(selfAssessment: File, medical: File, audioVideo?: File) {
  const formData = new FormData();
  formData.append('selfAssessment', selfAssessment);
  formData.append('medical', medical);
  if (audioVideo) {
    formData.append('audioVideo', audioVideo);
  }
  return formData;
}

// ===== 来自 api.20260309.md 的正式评估接口 =====
/** 创建被保险人，保存客户基本信息。 */
export function createInsuredPerson(data: CreateInsuredPersonPayload) {
  return post<InsuredPerson>(`${ BASE_URL }/insured-persons`, data);
}

/** 查询全部被保险人列表。 */
export function getInsuredPersonList() {
  return get<InsuredPerson[]>(`${ BASE_URL }/insured-persons`);
}

/** 根据身份证号精确查询被保险人。 */
export function getInsuredPersonByIdCard(idCard: string) {
  return get<InsuredPerson>(`${ BASE_URL }/insured-persons/idcard/${ idCard }`);
}

/** 根据姓名关键词模糊搜索被保险人。 */
export function searchInsuredPersons(name: string) {
  return get<InsuredPerson[]>(`${ BASE_URL }/insured-persons/search`, { name });
}

/** 创建评估草稿，开始一次新的评估。 */
export function createAssessmentDraft(data: CreateAssessmentDraftPayload) {
  return post<AssessmentDraft>(`${ BASE_URL }/assessments`, data);
}

/** 获取评估详情，包含评估主表和所有评估项目。 */
export function getAssessmentDetail(assessmentId: number) {
  return get<AssessmentDetailResult>(`${ BASE_URL }/assessments/${ assessmentId }/detail`);
}

/** 提交评估结果，由后端自动计算失能等级。 */
export function submitAssessmentResult(assessmentId: number, data: SubmitAssessmentPayload) {
  return post<SubmittedAssessment>(`${ BASE_URL }/assessments/${ assessmentId }/submit`, data);
}

/** 上传自评表并触发 OCR 解析，已替代旧的单独自评表上传接口。 */
export function uploadAndParseSelfAssessment(assessmentId: number, file: File) {
  return postForm<ParseSelfAssessmentResult>(
    `${ BASE_URL }/files/${ assessmentId }/self-assessment/parse`,
    createFileFormData(file),
  );
}

/** 上传医疗资料文件并返回 OCR 识别结果（支持多文件）。 */
export function uploadMedicalFile(assessmentId: number, files: File[]) {
  return postForm<UploadMedicalFileResult>(
    `${ BASE_URL }/files/${ assessmentId }/medical`,
    createFilesFormData(files),
  );
}

/** 上传音视频材料。 */
export function uploadVideoFile(assessmentId: number, file: File) {
  return postForm<UploadedFile>(
    `${ BASE_URL }/files/${ assessmentId }/video`,
    createFileFormData(file),
  );
}

/** 删除指定上传文件。 */
export function deleteUploadedFile(fileId: number) {
  return del<void>(`${ BASE_URL }/files/${ fileId }`);
}

/** 获取指定评估下的全部上传文件。 */
export function getAssessmentFiles(assessmentId: number) {
  return get<UploadedFile[]>(`${ BASE_URL }/files/${ assessmentId }`);
}

/** 生成 AI 评估建议，结果会自动入库。 AI解析 */
export function generateAiSuggestion(assessmentId: number, selfAssessment: File, medical: File, audioVideo?: File) {
  return postForm<AiSuggestionResult>(
    `${ BASE_URL }/deepseek/suggestion/${ assessmentId }`,
    createAiSuggestionFormData(selfAssessment, medical, audioVideo),
  );
}
/** 生成 AI 评估建议，结果会自动入库。 提示词二  事中评估 */
export function generateAiSuggestion2(assessmentId: number, selfAssessment: File, medical: File, audioVideo?: File) {
  return postForm<AiSuggestionResult>(
    `${ BASE_URL }/deepseek/inPocessAssessment/${ assessmentId }`,
    createAiSuggestionFormData(selfAssessment, medical, audioVideo),
  );
}
/** 生成 AI 评估建议，结果会自动入库。 提示词三  结构化提取 */
export function generateAiSuggestion3(assessmentId: number, selfAssessment: File, medical: File, audioVideo?: File) {
  return postForm<AiSuggestionResult>(
    `${ BASE_URL }/deepseek/self-assessment/extract/${ assessmentId }`,
    createAiSuggestionFormData(selfAssessment, medical, audioVideo),
  );
}


/** 查询已生成的 AI 评估建议。提示词一 */
export function getAiSuggestion(assessmentId: number) {
  return get<AiSuggestionResult>(`${ BASE_URL }/ai/suggestion/${ assessmentId }`);
}



// ===== 历史记录接口（当前无正式文档，保留兼容） =====
/** 历史记录兼容接口基础路径。 */
const HISTORY_BASE = '/mock-api/ltci-assessment';

/** 获取评估历史列表。 */
export function getAssessmentHistoryList(params: HistoryListParams) {
  return get<PaginatedData<AssessmentRecord>>(`${ HISTORY_BASE }/history`, params);
}

/** 获取评估历史详情。 */
export function getAssessmentHistoryDetail(id: string) {
  return get<AssessmentRecord>(`${ HISTORY_BASE }/history/${ id }`);
}

/** 删除评估历史记录。 */
export function deleteAssessmentHistory(id: string) {
  return del<void>(`${ HISTORY_BASE }/history/${ id }`);
}

/**
 * 保存评估历史记录的请求参数。
 *
 * 当前用于历史模块兼容接口，字段定义来自前端页面数据结构。
 */
export interface SaveAssessmentPayload {
  /** 正式评估记录 ID。 */
  assessmentId?: number;
  /** 基本信息。 */
  basicInfo: {
    /** 被保险人姓名。 */
    insureeName: string;
    /** 身份证号。 */
    idCard: string;
    /** 联系电话。 */
    phone: string;
    /** 参保地。 */
    insuranceArea: string;
    /** 评估日期。 */
    assessmentDate: string;
    /** 评估人员。 */
    assessor: string;
  };
  /** 评估项目列表。 */
  assessmentItems: AssessmentItem[];
  /** 自评表数据。 */
  selfAssessmentData: SelfAssessmentData;
  /** 已上传文件信息。 */
  filesInfo: {
    /** 自评表文件列表。 */
    selfAssessment: FileMetaInfo[];
    /** 医疗资料文件列表。 */
    medical: FileMetaInfo[];
    /** 音视频材料列表。 */
    video: FileMetaInfo[];
  };
  /** 平均等级。 */
  avgGrade: number;
  /** 失能等级。 */
  disabilityLevel: DisabilityLevel | string;
  /** 已评分项目数量。 */
  gradedCount: number;
  /** 正式评估状态。 */
  status?: number;
  /** 正式提交时间。 */
  submitTime?: string;
}

/** 保存评估历史记录。 */
export function saveAssessment(data: SaveAssessmentPayload) {
  return post<{ id: string }>(`${ HISTORY_BASE }/history`, data);
}
