import { defineFakeRoute } from 'vite-plugin-fake-server/client';
import { initialRecords } from './records';

// 内存中的记录列表（支持增删）
let records = [...initialRecords];

let nextId = 11;
let nextInsuredPersonId = 1;
let nextAssessmentId = 1001;
let nextFileId = 1;

// 下面三组内存数据用于模拟 api.20260306.md 中的新接口链路。
const insuredPersons: Array<{
  id: number;
  name: string;
  idCard: string;
  phone?: string;
  insuranceArea?: string;
  assessor?: string;
  createdAt: string;
  updatedAt: string;
}> = [];

const assessments = new Map<number, {
  id: number;
  insuredPersonId: number;
  idCard: string;
  name: string;
  assessmentDate: string;
  assessor: string;
  status: number;
  createdAt: string;
  submitTime?: string;
}>();

const uploadedFiles = new Map<number, {
  id: number;
  assessmentId: number;
  fileType: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}>();

const mockSelfAssessment = {
  eat: 2,
  wash: 1,
  dress: 1,
  toilet: 2,
  move: 1,
  memory: 3,
  orientation: 3,
  emotion: 2,
  social: 2,
  vision: 3,
  language: 3,
  selfGrade: 'E级',
};

function parseNumericId(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function createUploadedFile(assessmentId: number, fileType: number, fileNamePrefix: string) {
  const fileId = nextFileId++;
  const extension = fileType === 3 ? '.mp4' : '.pdf';
  const file = {
    id: fileId,
    assessmentId,
    fileType,
    fileName: `${ fileNamePrefix }-${ fileId }${ extension }`,
    fileSize: 1024 * (fileType === 3 ? 2048 : 300),
    uploadedAt: new Date().toISOString(),
  };
  uploadedFiles.set(fileId, file);
  return file;
}

function calculateResult(items: Array<{ grade?: number }>) {
  const validItems = items.filter((item) => typeof item.grade === 'number');
  const itemCount = validItems.length;
  if (itemCount === 0) {
    return {
      finalScore: 0,
      finalGrade: '未完成评估',
      itemCount: 0,
    };
  }
  const total = validItems.reduce((sum, item) => sum + (item.grade || 0), 0);
  const finalScore = Number((total / itemCount).toFixed(1));
  let finalGrade = '轻度失能';
  if (finalScore >= 2) {
    finalGrade = '重度失能';
  } else if (finalScore >= 1) {
    finalGrade = '中度失能';
  }
  return { finalScore, finalGrade, itemCount };
}

const BASE_URL = '/mock-api';
export default defineFakeRoute([
  {
    url: `${BASE_URL}/insured-persons`,
    method: 'post',
    response: ({ body }) => {
      const now = new Date().toISOString();
      const record = {
        id: nextInsuredPersonId++,
        name: body?.name || '',
        idCard: body?.idCard || '',
        phone: body?.phone || '',
        insuranceArea: body?.insuranceArea || '',
        assessor: body?.assessor || '',
        createdAt: now,
        updatedAt: now,
      };
      insuredPersons.push(record);
      return { code: 200, message: 'success', data: record };
    },
  },
  {
    url: '/api/assessments',
    method: 'post',
    response: ({ body }) => {
      const insuredPersonId = Number(body?.insuredPersonId);
      const insuredPersonExists = insuredPersons.some((item) => item.id === insuredPersonId);
      if (!insuredPersonExists) {
        return { code: 404, message: '被保险人不存在', data: null };
      }

      const draft = {
        id: nextAssessmentId++,
        insuredPersonId,
        idCard: body?.idCard || '',
        name: body?.name || '',
        assessmentDate: body?.assessmentDate || '',
        assessor: body?.assessor || '',
        status: 0,
        createdAt: new Date().toISOString(),
      };
      assessments.set(draft.id, draft);
      return { code: 200, message: 'success', data: draft };
    },
  },
  {
    url: `${BASE_URL}/assessments/:assessmentId/submit`,
    method: 'post',
    response: ({ params, body }) => {
      const assessmentId = parseNumericId(params.assessmentId);
      if (!assessmentId || !assessments.has(assessmentId)) {
        return { code: 404, message: '评估草稿不存在', data: null };
      }

      const draft = assessments.get(assessmentId)!;
      const items = Array.isArray(body?.items) ? body.items : [];
      // mock 仅模拟基础计算规则，实际以真实后端规则为准。
      const { finalScore, finalGrade, itemCount } = calculateResult(items);
      const submitTime = new Date().toISOString();
      draft.status = 1;
      draft.submitTime = submitTime;

        return {
          code: 200,
          message: 'success',
          data: {
            id: draft.id,
            insuredPersonId: draft.insuredPersonId,
            idCard: draft.idCard,
            assessmentDate: draft.assessmentDate,
            name: draft.name,
            assessor: draft.assessor,
            finalGrade,
            finalScore,
          itemCount,
          status: draft.status,
          submitTime,
        },
      };
    },
  },
  {
    url: `${BASE_URL}/files/:assessmentId/self-assessment/parse`,
    method: 'post',
    response: ({ params }) => {
      const assessmentId = parseNumericId(params.assessmentId);
      if (!assessmentId || !assessments.has(assessmentId)) {
        return { code: 404, message: '评估草稿不存在', data: null };
      }

      const file = createUploadedFile(assessmentId, 1, 'self-assessment');
      return {
        code: 200,
        message: 'success',
        data: {
          file: {
            id: file.id,
            fileName: file.fileName,
          },
          selfAssessment: mockSelfAssessment,
        },
      };
    },
  },
  {
    url: `${BASE_URL}/files/:assessmentId/self-assessment`,
    method: 'post',
    response: ({ params }) => {
      const assessmentId = parseNumericId(params.assessmentId);
      if (!assessmentId || !assessments.has(assessmentId)) {
        return { code: 404, message: '评估草稿不存在', data: null };
      }
      const file = createUploadedFile(assessmentId, 1, 'self-assessment');
      return { code: 200, message: 'success', data: file };
    },
  },
  {
    url: `${BASE_URL}/files/:assessmentId/medical`,
    method: 'post',
    response: ({ params }) => {
      const assessmentId = parseNumericId(params.assessmentId);
      if (!assessmentId || !assessments.has(assessmentId)) {
        return { code: 404, message: '评估草稿不存在', data: null };
      }
      const file = createUploadedFile(assessmentId, 2, 'medical');
      return { code: 200, message: 'success', data: file };
    },
  },
  {
    url: `${BASE_URL}/files/:assessmentId/video`,
    method: 'post',
    response: ({ params }) => {
      const assessmentId = parseNumericId(params.assessmentId);
      if (!assessmentId || !assessments.has(assessmentId)) {
        return { code: 404, message: '评估草稿不存在', data: null };
      }
      const file = createUploadedFile(assessmentId, 3, 'video');
      return { code: 200, message: 'success', data: file };
    },
  },
  {
    url: `${BASE_URL}/files/:fileId`,
    method: 'delete',
    response: ({ params }) => {
      const fileId = parseNumericId(params.fileId);
      if (!fileId || !uploadedFiles.has(fileId)) {
        return { code: 404, message: '文件不存在', data: null };
      }
      uploadedFiles.delete(fileId);
      return { code: 200, message: '删除成功', data: null };
    },
  },
  {
    url: `${BASE_URL}/ltci-assessment/history`,
    method: 'get',
    response: ({ query }) => {
      const page = parseInt(query.page as string) || 1;
      const pageSize = parseInt(query.pageSize as string) || 10;
      const insureeName = (query.insureeName as string) || '';
      const disabilityLevel = (query.disabilityLevel as string) || '';
      const dateStart = query['dateRange[0]'] as string || query.dateStart as string || '';
      const dateEnd = query['dateRange[1]'] as string || query.dateEnd as string || '';

      let filtered = [...records];

      if (insureeName) {
        filtered = filtered.filter((r) => r.insureeName.includes(insureeName));
      }
      if (disabilityLevel) {
        filtered = filtered.filter((r) => r.disabilityLevel === disabilityLevel);
      }
      if (dateStart) {
        filtered = filtered.filter((r) => r.assessmentDate >= dateStart);
      }
      if (dateEnd) {
        filtered = filtered.filter((r) => r.assessmentDate <= dateEnd);
      }

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);

      return {
        code: 200,
        message: 'success',
        data: { list, total, page, pageSize },
      };
    },
  },
  {
    url: `${BASE_URL}/ltci-assessment/history/:id`,
    method: 'get',
    response: ({ params }) => {
      const record = records.find((r) => r.id === params.id);
      if (!record) {
        return { code: 404, message: '记录不存在', data: null };
      }
      return { code: 200, message: 'success', data: record };
    },
  },
  {
    url: `${BASE_URL}/ltci-assessment/history/:id`,
    method: 'delete',
    response: ({ params }) => {
      const idx = records.findIndex((r) => r.id === params.id);
      if (idx === -1) {
        return { code: 404, message: '记录不存在', data: null };
      }
      records.splice(idx, 1);
      return { code: 200, message: '删除成功', data: null };
    },
  },
  {
    url: `${BASE_URL}/ltci-assessment/history`,
    method: 'post',
    response: ({ body }) => {
      const id = `rec-${ String(nextId++).padStart(3, '0') }`;
      const record = {
        id,
        assessmentId: body.assessmentId || undefined,
        insureeName: body.basicInfo?.insureeName || '',
        idCard: body.basicInfo?.idCard || '',
        phone: body.basicInfo?.phone || '',
        insuranceArea: body.basicInfo?.insuranceArea || '',
        assessmentDate: body.basicInfo?.assessmentDate || '',
        assessor: body.basicInfo?.assessor || '',
        avgGrade: body.avgGrade || 0,
        disabilityLevel: body.disabilityLevel || '未完成评估',
        gradedCount: body.gradedCount || 0,
        status: body.status || undefined,
        submitTime: body.submitTime || undefined,
        assessmentItems: body.assessmentItems || [],
        selfAssessmentData: body.selfAssessmentData || {},
        filesInfo: body.filesInfo || { selfAssessment: [], medical: [], video: [] },
        createdAt: new Date().toISOString(),
      };
      records.unshift(record);
      return { code: 200, message: '保存成功', data: { id } };
    },
  },
]);
