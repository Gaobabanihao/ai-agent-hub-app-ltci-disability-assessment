<script setup lang="ts">
import { watch } from 'vue';
import type { FormRules } from 'element-plus';
import { useAssessment } from '../composables/useAssessment';

defineOptions({ name: 'Step1InfoEntry' });

const { basicInfo, isInfoComplete, advanceStep } = useAssessment();

basicInfo.insureeName = '张三';
basicInfo.idCard = '652928199906206814';
basicInfo.phone = '133123412334';
basicInfo.insuranceArea = '北京市朝阳区';
basicInfo.assessmentDate = '2026-03-06';
basicInfo.assessor = '李医生';

const rules: FormRules = {
  insureeName: [{ required: true, message: '请填写被保险人姓名', trigger: 'blur' }],
  idCard: [
    { required: true, message: '请填写身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确', trigger: 'blur' },
  ],
  assessmentDate: [{ required: true, message: '请选择评估日期', trigger: 'change' }],
  assessor: [{ required: true, message: '请填写评估人员姓名', trigger: 'blur' }],
};

watch(isInfoComplete, (val) => {
  if (val) advanceStep(2);
});
</script>

<template>
  <div class="info-card">
    <div class="card-header">
      <el-icon class="card-header__icon"><User /></el-icon>
      <h2>被保险人基本信息</h2>
    </div>

    <el-form
      :model="basicInfo"
      :rules="rules"
      label-width="120px"
      label-position="right"
      class="info-form"
    >
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12">
          <el-form-item label="被保险人姓名" prop="insureeName" required>
            <el-input v-model="basicInfo.insureeName" placeholder="请输入姓名" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="身份证号" prop="idCard" required>
            <el-input
              v-model="basicInfo.idCard"
              placeholder="请输入身份证号"
              clearable
              maxlength="18"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="basicInfo.phone" placeholder="请输入联系电话" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="参保地" prop="insuranceArea">
            <el-input v-model="basicInfo.insuranceArea" placeholder="请输入参保地" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="评估日期" prop="assessmentDate" required>
            <el-date-picker
              v-model="basicInfo.assessmentDate"
              type="date"
              placeholder="请选择评估日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="评估人员" prop="assessor" required>
            <el-input
              v-model="basicInfo.assessor"
              placeholder="请输入评估人员姓名"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div v-if="isInfoComplete" class="info-complete-tip">
      <el-icon><CircleCheckFilled /></el-icon>
      <span>基本信息已填写完整，请继续上传评估材料</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.info-card {
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

.info-form {
  padding: 24px 24px 8px;
}

.info-complete-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 24px 20px;
  padding: 10px 16px;
  background: #f0f9eb;
  border: 1px solid #b3e19d;
  border-radius: 6px;
  color: #67c23a;
  font-size: 13px;

  .el-icon {
    font-size: 16px;
  }
}
</style>
