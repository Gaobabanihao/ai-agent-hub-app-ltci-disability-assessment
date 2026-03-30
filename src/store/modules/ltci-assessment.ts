import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getAssessmentHistoryList,
  getAssessmentDetail,
  deleteAssessmentHistory,
  saveAssessment,
} from '@/api/ltci-assessment';
import type { AssessmentRecord, HistoryListParams } from '@/views/ltci-assessment/types';
import type { SaveAssessmentPayload } from '@/api/ltci-assessment';

export const useLtciAssessmentStore = defineStore('ltci-assessment', () => {
  const list = ref<any[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const detailLoading = ref(false);
  const currentRecord = ref<any | null>(null);

  async function fetchList(params: HistoryListParams) {
    loading.value = true;
    try {
      const data = await getAssessmentHistoryList(params);
      list.value = data.result;
      total.value = data.total;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDetail(id: string) {
    detailLoading.value = true;
    try {
      // 调用真实的后端接口获取评估详情
      const assessmentId = parseInt(id);
      const detail = await getAssessmentDetail(assessmentId);
      // 转换为前端需要的格式
      currentRecord.value = {
        id: id,
        name: detail.assessment.name,
        idCard: detail.assessment.idCard,
        assessmentDate: detail.assessment.assessmentDate,
        finalGrade: detail.assessment.finalGrade,
        itemCount: detail.assessment.itemCount,
        submitTime: detail.assessment.submitTime,
        // 其他需要的字段
        assessmentId: detail.assessment.id,
        phone: '',
        insuranceArea: '',
        assessor: detail.assessment.assessor,
        avgGrade: 0,
        disabilityLevel: detail.assessment.finalGrade,
        gradedCount: detail.assessment.itemCount,
        status: detail.assessment.status,
        assessmentItems: detail.items.map(item => ({
          category: '',
          categoryId: item.category,
          itemId: item.itemCode,
          item: item.itemName,
          selfItem: item.itemCode,
          grade: item.grade.toString(),
          note: item.assessmentNote || ''
        })),
        selfAssessmentData: {},
        filesInfo: {
          selfAssessment: [],
          medical: [],
          video: []
        },
        createdAt: detail.assessment.createdAt
      };
    } finally {
      detailLoading.value = false;
    }
  }

  async function removeRecord(id: string) {
    await deleteAssessmentHistory(id);
    list.value = list.value.filter((r) => r.id !== id);
    total.value = Math.max(0, total.value - 1);
  }

  async function save(payload: SaveAssessmentPayload) {
    return saveAssessment(payload);
  }

  return {
    list,
    total,
    loading,
    detailLoading,
    currentRecord,
    fetchList,
    fetchDetail,
    removeRecord,
    save,
  };
});
