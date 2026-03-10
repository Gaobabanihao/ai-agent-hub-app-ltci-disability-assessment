# 长护失能评估接口对接说明（2026-03-06）

## 1. 目标与范围
- 本文档用于说明“失能评估主流程”在前端与后端接口之间的对接关系。
- 对接依据：`docx/apis/api.20260306.md`。
- 当前覆盖范围：评估主流程（创建被保险人、创建评估、文件上传、提交评估）。
- 当前未覆盖范围：历史记录正式接口（暂无接口文档，仍保留兼容实现）。

## 2. 业务主流程（前端执行顺序）
1. 用户填写被保险人基本信息。
2. 前端调用 `POST /insured-persons` 创建被保险人。
3. 前端调用 `POST /assessments` 创建评估草稿，拿到 `assessmentId`。
4. 用户上传材料：
   - 自评表：图片走 OCR 解析接口，非图片走普通上传接口。
   - 医疗资料：走医疗上传接口。
   - 音视频：走音视频上传接口。
5. 用户录入 11 项评估分值与备注。
6. 前端校验 11 项是否全部完成。
7. 前端调用 `POST /assessments/{assessmentId}/submit` 提交结果。
8. 页面展示后端返回的 `finalGrade/finalScore/itemCount`。

## 3. 接口对接清单

### 3.1 被保险人与评估
| 接口 | 方法 | 关键请求字段 | 关键响应字段 | 前端用途 |
| --- | --- | --- | --- | --- |
| `/insured-persons` | POST | `name,idCard,phone,insuranceArea,assessor` | `id` | 创建被保险人，供创建评估草稿使用 |
| `/assessments` | POST | `insuredPersonId,idCard,assessmentDate,assessor` | `id,status` | 创建评估草稿，生成 `assessmentId` |
| `/assessments/{assessmentId}/submit` | POST | `items[]`（11项） | `finalGrade,finalScore,itemCount,status` | 提交最终评估并获取后端计算结论 |

### 3.2 文件上传
| 接口 | 方法 | 请求格式 | 关键请求字段 | 关键响应字段 | 前端用途 |
| --- | --- | --- | --- | --- | --- |
| `/files/{assessmentId}/self-assessment` | POST | `multipart/form-data` | `file` | `id,fileName,fileSize` | 普通上传自评表（PDF等） |
| `/files/{assessmentId}/self-assessment/parse` | POST | `multipart/form-data` | `file` | `file,selfAssessment` | 上传并 OCR 解析自评表（图片） |
| `/files/{assessmentId}/medical` | POST | `multipart/form-data` | `file` | `id,fileName,fileSize` | 上传医疗资料 |
| `/files/{assessmentId}/video` | POST | `multipart/form-data` | `file` | `id,fileName,fileSize` | 上传音视频材料 |
| `/files/{fileId}` | DELETE | - | 路径参数 `fileId` | - | 删除已上传文件 |

## 4. 字段映射规则

### 4.1 Step1 基本信息 -> 创建被保险人/评估草稿
- `insureeName` -> `name`
- `idCard` -> `idCard`
- `phone` -> `phone`
- `insuranceArea` -> `insuranceArea`
- `assessor` -> `assessor`
- `assessmentDate` -> `assessmentDate`

### 4.2 Step3 评估项 -> submit items[]
- `category`：按文档固定映射  
  - 1 日常生活：`eat/wash/dress/toilet/move`
  - 2 认知：`memory/orientation`
  - 3 情绪：`emotion/social`
  - 4 感知觉：`vision/language`
- `itemCode`：使用上述固定代码。
- `itemName`：页面中文名称（如“进食”）。
- `grade`：评估等级（整数）。
- `selfGrade`：如自评存在则带上，否则不传。
- `assessmentNote`：评估意见，空值不传。

### 4.3 自评 OCR 结果 -> 前端自评数据
- 使用文档返回字段：`eat,wash,dress,toilet,move,memory,orientation,emotion,social,vision,language`。
- 前端统一以英文 code 作为自评 key，避免中文 key 与接口字段不一致。
- 历史兼容：读取老记录时支持中文 key 自动转换为英文 key。

## 5. 页面交互与校验约束
- 进入评估录入前，必须先创建评估草稿（保证后续上传/提交都有 `assessmentId`）。
- 自评表上传策略：
  - 图片（`jpg/jpeg/png`）走 `/self-assessment/parse`。
  - 非图片（如 `pdf`）走 `/self-assessment`。
- 提交校验：
  - 必须完成全部 11 项评分，未完成则禁止提交并提示。
- 提交后展示：
  - 以后端返回的最终等级为准。

## 6. 环境与 mock 说明
- 当前开发环境仍启用 `vitePluginFakeServer`。
- `VITE_ENABLE_PROD_MOCK=false` 仅控制生产构建，不控制开发环境。
- 若需切到真实后端：
  1. 关闭开发 mock 插件；
  2. 在 Vite `server.proxy` 配置 `/api -> http://localhost:8080`；
  3. 重启本地开发服务。

## 7. 代码落点（便于排查）
- 接口定义：`src/api/ltci-assessment.ts`
- 请求封装（含 `postForm`）：`src/utils/requests/index.ts`
- 主流程状态与提交：`src/views/ltci-assessment/composables/useAssessment.ts`
- 评分与结果文案：`src/views/ltci-assessment/composables/useScoring.ts`
- 文件上传页面：`src/views/ltci-assessment/components/Step2FileUpload.vue`
- 结果确认页面：`src/views/ltci-assessment/components/Step4ResultConfirm.vue`
- 开发 mock：`mock/ltci-assessment.ts`

## 8. 当前差距与后续建议
- 历史记录接口尚无正式文档，当前是兼容实现，建议后续单独补齐契约。
- 建议后端补充统一错误码说明，便于前端精细化提示（如重复身份证、评估已提交、文件类型不支持等）。
