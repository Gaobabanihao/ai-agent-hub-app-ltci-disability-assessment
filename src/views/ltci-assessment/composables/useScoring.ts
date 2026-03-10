import type { AssessmentItem, BasicInfo, DisabilityLevel, AssessmentResult } from '../types';
import type { FileInfo } from '../types';
import { SELF_ASSESSMENT_MAPPING } from '../constants/assessment-data';
import type { SubmittedAssessment } from '@/api/ltci-assessment';

// ─── AI 建议结构 ─────────────────────────────────────────────────────────────

export interface AISuggestion {
  /** 基于医疗材料的建议 */
  medical: string;
  /** 基于音视频材料的建议 */
  video: string;
  /** 自评结论与专业评估对比 */
  selfAssessment: string;
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useScoring(
  assessmentItems: AssessmentItem[],
  files: Record<string, FileInfo[]>,
  selfAssessmentData: Record<string, string>
) {
  const selfAssessmentFiles = files.selfAssessment || [];
  const medicalFiles = files.medical || [];
  const videoFiles = files.video || [];

  // ── 综合得分计算 ────────────────────────────────────────────────────────────

  function calculateResult(): AssessmentResult {
    const gradedItems = assessmentItems.filter((item) => item.grade !== null);

    if (gradedItems.length === 0) {
      return { avgGrade: 0, disabilityLevel: '未完成评估', gradedCount: 0 };
    }

    const totalGrade = gradedItems.reduce((sum, item) => sum + parseInt(item.grade!), 0);
    const avgGrade = totalGrade / gradedItems.length;

    let disabilityLevel: DisabilityLevel;
    // 本地预览评分方向与接口文档一致：分值越高，失能越重。
    // 最终等级以后端 submit 接口返回结果为准。
    if (avgGrade >= 2) disabilityLevel = '重度失能';
    else if (avgGrade >= 1) disabilityLevel = '中度失能';
    else disabilityLevel = '轻度失能';

    return { avgGrade, disabilityLevel, gradedCount: gradedItems.length };
  }

  // ── AI 辅助建议（结构化，供模板分段渲染） ──────────────────────────────────

  function generateAISuggestion(
    itemName: string,
    grade: string,
    selfItemCode: string
  ): AISuggestion {
    // 医疗材料建议
    const medical =
      medicalFiles.length > 0
        ? `根据上传的 ${medicalFiles.length} 份医疗材料分析，${itemName}功能评估建议定为 ${grade} 级，符合现有医疗记录所描述的功能状态。`
        : '暂无医疗材料，无法生成医疗建议。';

    // 音视频材料建议
    const video =
      videoFiles.length > 0
        ? `通过 ${videoFiles.length} 份音视频材料观察，被评估人${itemName}能力表现与 ${grade} 级标准相符。`
        : '暂无音视频材料，无法生成观察建议。';

    // 自评对比建议
    let selfAssessment = '';
    const selfGrade = selfAssessmentData[selfItemCode];
    if (selfAssessmentFiles.length > 0 && selfGrade !== undefined) {
      const selfDesc = SELF_ASSESSMENT_MAPPING[selfItemCode]?.[selfGrade] ?? '';
      if (selfGrade === grade) {
        selfAssessment = `客户自评${itemName}为 ${selfGrade} 级（${selfDesc}），与专业评估结果一致。`;
      } else {
        selfAssessment = `客户自评${itemName}为 ${selfGrade} 级（${selfDesc}），与专业评估 ${grade} 级存在差异，建议综合实际情况综合判断。`;
      }
    }

    return { medical, video, selfAssessment };
  }

  // ── 评估结论汇总文本 ────────────────────────────────────────────────────────

  function getSummaryText(basicInfo: BasicInfo, submittedResult?: SubmittedAssessment | null): string {
    const result = calculateResult();
    const lines: string[] = [];
    const finalGrade = submittedResult?.finalGrade || result.disabilityLevel;
    const finalScore = submittedResult?.finalScore ?? result.avgGrade;
    const finalItemCount = submittedResult?.itemCount ?? result.gradedCount;

    lines.push('### 长期护理保险失能等级评估结论', '');

    lines.push('**被保险人信息：**');
    lines.push(`姓名：${basicInfo.insureeName || '未填写'}`);
    lines.push(`身份证号：${basicInfo.idCard || '未填写'}`);
    lines.push(`评估日期：${basicInfo.assessmentDate || '未填写'}`);
    lines.push(`评估人员：${basicInfo.assessor || '未填写'}`);
    lines.push('');

    if (selfAssessmentFiles.length > 0 && selfAssessmentFiles[0]) {
      lines.push('**客户自评信息：**');
      lines.push(`- 已上传自评表：${selfAssessmentFiles[0].name}`);
      lines.push('- 自评综合等级：E 级（可申请长期护理失能等级评估）');
      lines.push('');
    }

    const gradedItems = assessmentItems.filter((item) => item.grade !== null);
    if (gradedItems.length > 0) {
      lines.push('**各维度评估结果：**');
      gradedItems.forEach((item) => {
        lines.push(`- ${item.category} — ${item.item}：${item.grade} 级`);
        const selfGrade = selfAssessmentData[item.selfItem];
        if (selfGrade !== undefined) {
          const selfDesc = SELF_ASSESSMENT_MAPPING[item.selfItem]?.[selfGrade] ?? '';
          lines.push(`  客户自评：${selfGrade} 级 — ${selfDesc}`);
        }
        if (item.note) lines.push(`  评估意见：${item.note}`);
      });
      lines.push('');
    }

    if (finalItemCount > 0) {
      lines.push('**综合评估结论：**');
      lines.push(
        `本次评估综合得分为 ${finalScore.toFixed(1)} 分，被保险人失能等级评定为：**${finalGrade}**。`
      );
      lines.push('');

      if (selfAssessmentFiles.length > 0) {
        lines.push('**自评与专业评估对比：**');
        lines.push(
          `客户自评等级为 E 级，专业评估等级为${finalGrade}，符合申请条件。`
        );
      }
    } else {
      lines.push('请完成各项评估后，系统将自动汇总评估结论...');
    }

    return lines.join('\n');
  }

  return { calculateResult, generateAISuggestion, getSummaryText };
}
