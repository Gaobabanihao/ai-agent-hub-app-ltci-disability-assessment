import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getAssessmentHistoryList,
  getAssessmentHistoryDetail,
  deleteAssessmentHistory,
  saveAssessment,
} from '@/api/ltci-assessment';
import type { AssessmentRecord, HistoryListParams } from '@/views/ltci-assessment/types';
import type { SaveAssessmentPayload } from '@/api/ltci-assessment';

export const useLtciAssessmentStore = defineStore('ltci-assessment', () => {
  const list = ref<AssessmentRecord[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const detailLoading = ref(false);
  const currentRecord = ref<AssessmentRecord | null>(null);

  async function fetchList(params: HistoryListParams) {
    loading.value = true;
    try {
      const data = await getAssessmentHistoryList(params);
      list.value = data.list;
      total.value = data.total;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDetail(id: string) {
    detailLoading.value = true;
    try {
      currentRecord.value = await getAssessmentHistoryDetail(id);
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
