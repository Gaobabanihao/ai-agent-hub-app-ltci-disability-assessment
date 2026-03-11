# LTCI 失能评估应用 AI 代理指令

## 架构概述
这是一个用于长期护理保险 (LTCI) 失能评估的 Vue 3 + TypeScript + Vite 应用。主要组件：
- **前端**：Vue 3 组合式 API 使用 `<script setup>`，Pinia 用于状态管理，Vue Router 用于导航
- **UI**：Element Plus 组件 + UnoCSS 实用类
- **构建**：Vite 带有自定义插件，用于自动导入、压缩和块分割
- **API**：基于 Axios 的请求，代理到后端 `/ltci-api` → `http://10.48.231.176:8080/api`
- **评估流程**：4 步向导（信息 → 上传 → 评估 → 确认），使用组合式函数进行状态/逻辑分离

## 关键工作流
- **开发**：`pnpm dev`（在环境端口上服务，预热视图/组件）
- **构建**：`pnpm build`（包括类型检查、rimraf dist、压缩）
- **类型检查**：`pnpm type-check`（vue-tsc -b）
- **清理**：`pnpm clean`（自定义脚本清理 dist/node_modules）
- **API 代理**：所有 `/ltci-api/*` 路由重写到后端；在文件上传前确保创建草稿
- **文件上传**：自评图片自动 OCR 解析；医疗/视频文件存储在服务器端

## 项目约定
- **状态管理**：使用组合式函数（例如 `views/ltci-assessment/composables/` 中的 `useAssessment`）进行功能逻辑；Pinia 存储用于全局状态
- **数据流**：表单状态使用响应式对象；`ensureAssessmentDraft()` 在变更前创建后端草稿
- **评估评分**：11 项平均等级；等级：≥2 重度，≥1 中度，<1 轻度失能
- **自评**：通过 `useAssessment.ts` 中的 `LEGACY_SELF_ASSESSMENT_KEY_MAP` 规范化旧版中文键
- **文件处理**：`toFileInfo()` 格式化大小/区域；删除需要后端 ID
- **错误处理**：ElMessage 用于用户反馈；在创建草稿前验证基本信息（身份证正则：`/^\d{17}[\dXx]$/`）
- **导入**：通过 unplugin 自动导入（Vue、Element Plus 图标）；显式导入工具/API
- **样式**：UnoCSS 类（例如 `flex items-center`）；SCSS 用于 `style/` 中的自定义样式
- **路由**：静态路由在 `router/modules/`；进度条通过 NProgress 包装器

## 关键文件和模式
- **主要逻辑**：`src/views/ltci-assessment/composables/useAssessment.ts` - 中央状态和 API 编排
- **评分**：`src/views/ltci-assessment/composables/useScoring.ts` - calculateResult() 用于平均/等级
- **常量**：`src/views/ltci-assessment/constants/assessment-data.ts` - ASSESSMENT_CATEGORIES 带有等级/项
- **API**：`src/api/ltci-assessment.ts` - 类型化接口和 axios 包装器
- **类型**：`src/views/ltci-assessment/types/` - 领域类型（AssessmentItem、FileInfo 等）
- **存储**：`src/store/modules/ltci-assessment.ts` - 全局评估状态
- **组件**：功能范围在 `views/ltci-assessment/components/`；可重用在 `src/components/`

## 集成点
- **后端同步**：草稿/被保险人由服务器端创建；提交需要所有 11 项等级
- **AI 建议**：从自评/医疗/视频文件生成；单独获取
- **文件解析**：自评图片 → OCR → selfAssessmentData 对象
- **验证**：前端硬检查（例如提交 11 项）；后端最终权威

遵循 Vue 3 最佳实践；优先组合式 API；维护响应式数据流；在提交前本地测试构建。</content>
<parameter name="filePath">d:\project\app-ltci-disability-assessment\ai-agent-hub-app-ltci-disability-assessment\.github\copilot-instructions.md