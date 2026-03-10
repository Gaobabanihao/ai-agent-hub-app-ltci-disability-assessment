/**
 * Markdown 渲染工具
 */
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 配置 marked
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // GitHub 风格
});

/**
 * 渲染 Markdown 并过滤 XSS
 * @param content Markdown 内容
 * @returns 安全的 HTML 字符串
 */
export function renderMarkdown(content: string): string {
  if (!content) return '';
  const html = marked.parse(content) as string;
  return DOMPurify.sanitize(html);
}
