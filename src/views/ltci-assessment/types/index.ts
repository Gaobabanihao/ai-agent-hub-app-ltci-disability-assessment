export interface BasicInfo {
  insureeName: string;
  idCard: string;
  phone: string;
  insuranceArea: string;
  assessmentDate: string;
  assessor: string;
}

export interface FileInfo {
  id: string;
  backendId?: number;
  name: string;
  size: string;
  rawSize?: number;
  time: string;
  file: File;
}

export type FileUploadType = 'selfAssessment' | 'medical' | 'video';

export interface AssessmentItem {
  category: string;
  categoryId: number | string;
  itemId: string;
  item: string;
  selfItem: string;
  grade: string | null;
  note: string;
}

export type SelfAssessmentData = Record<string, string>;

export type DisabilityLevel = '轻度失能' | '中度失能' | '重度失能' | '未完成评估';

export interface AssessmentResult {
  avgGrade: number;
  disabilityLevel: DisabilityLevel;
  gradedCount: number;
}

// 历史记录中保存的文件元数据（File 对象无法序列化，只存 meta）
export interface FileMetaInfo {
  id: string;
  name: string;
  size: string;
  time: string;
}

// 一条完整的历史评估记录（用于列表和详情）
export interface AssessmentRecord {
  id: string;
  assessmentId?: number;
  insureeName: string;
  idCard: string;
  phone: string;
  insuranceArea: string;
  assessmentDate: string;
  assessor: string;
  avgGrade: number;
  disabilityLevel: DisabilityLevel | string;
  gradedCount: number;
  status?: number;
  submitTime?: string;
  assessmentItems: AssessmentItem[];
  selfAssessmentData: SelfAssessmentData;
  filesInfo: {
    selfAssessment: FileMetaInfo[];
    medical: FileMetaInfo[];
    video: FileMetaInfo[];
  };
  createdAt: string;
}

// 列表查询参数
export interface HistoryListParams {
  page: number;
  pageSize: number;
  insureeName?: string;
  disabilityLevel?: DisabilityLevel | '';
  dateRange?: [string, string] | null;
}
