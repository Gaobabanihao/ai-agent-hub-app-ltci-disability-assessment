import { ref } from 'vue';
import type { Ref } from 'vue';

import { getToken } from './auth';

export type SSEStatus = 'idle' | 'connecting' | 'streaming' | 'done' | 'error' | 'aborted';

export interface SSEMessage {
  /** 事件类型 */
  event?: string;
  /** 消息数据 */
  data: string;
  /** 消息 ID */
  id?: string;
}

export interface SSEOptions {
  /** 请求方法 */
  method?: 'GET' | 'POST';
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求体（POST 时使用） */
  body?: unknown;
  /** 是否自动携带 token */
  withToken?: boolean;
  /** 收到消息回调 */
  onMessage?: (message: SSEMessage) => void;
  /** 收到文本块回调（用于流式文本拼接） */
  onChunk?: (chunk: string, fullText: string) => void;
  /** 开始回调 */
  onStart?: () => void;
  /** 完成回调 */
  onDone?: (fullText: string) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 中止回调 */
  onAbort?: () => void;
}

/**
 * SSE 流式请求封装
 *
 * 类似 ChatGPT 的流式响应，支持逐字输出
 *
 * @example
 * ```ts
 * const { start, abort, status, content, isStreaming } = useSSE();
 *
 * // 发起流式请求
 * await start('/api/chat/stream', {
 *   method: 'POST',
 *   body: { message: 'Hello' },
 *   onChunk: (chunk, fullText) => {
 *     console.log('收到:', chunk);
 *     console.log('完整内容:', fullText);
 *   },
 *   onDone: (fullText) => {
 *     console.log('完成:', fullText);
 *   },
 * });
 *
 * // 中止请求
 * abort();
 * ```
 */
export function useSSE() {
  const status: Ref<SSEStatus> = ref('idle');
  const content = ref('');
  const error: Ref<Error | null> = ref(null);

  let abortController: AbortController | null = null;

  /** 是否正在流式传输 */
  const isStreaming = () => status.value === 'streaming';

  /** 是否已完成 */
  const isDone = () => status.value === 'done';

  /** 重置状态 */
  function reset() {
    status.value = 'idle';
    content.value = '';
    error.value = null;
  }

  /** 中止请求 */
  function abort() {
    if (abortController) {
      abortController.abort();
      abortController = null;
      status.value = 'aborted';
    }
  }

  /** 发起 SSE 请求 */
  async function start(url: string, options: SSEOptions = {}) {
    const {
      method = 'POST',
      headers = {},
      body,
      withToken = true,
      onMessage,
      onChunk,
      onStart,
      onDone,
      onError,
      onAbort,
    } = options;

    // 重置状态
    reset();
    status.value = 'connecting';

    // 创建 AbortController
    abortController = new AbortController();

    // 构建请求头
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...headers,
    };

    if (withToken) {
      const token = getToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      status.value = 'streaming';
      onStart?.();

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // 处理缓冲区中剩余的数据
          if (buffer.trim()) {
            processSSEData(buffer, onMessage, onChunk);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // 按行分割处理 SSE 数据
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.trim()) {
            processSSEData(line, onMessage, onChunk);
          }
        }
      }

      status.value = 'done';
      onDone?.(content.value);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          status.value = 'aborted';
          onAbort?.();
        } else {
          status.value = 'error';
          error.value = err;
          onError?.(err);
        }
      }
    } finally {
      abortController = null;
    }
  }

  /** 处理 SSE 数据行 */
  function processSSEData(
    line: string,
    onMessage?: (message: SSEMessage) => void,
    onChunk?: (chunk: string, fullText: string) => void
  ) {
    // 跳过注释
    if (line.startsWith(':')) return;

    // 解析 SSE 格式
    if (line.startsWith('data:')) {
      const data = line.slice(5).trim();

      // 检查是否是结束标记
      if (data === '[DONE]') {
        return;
      }

      // 尝试解析 JSON
      try {
        const parsed = JSON.parse(data);

        // 兼容 OpenAI 格式
        let chunk = '';
        if (parsed.choices?.[0]?.delta?.content) {
          chunk = parsed.choices[0].delta.content;
        } else if (parsed.content) {
          chunk = parsed.content;
        } else if (parsed.text) {
          chunk = parsed.text;
        } else if (parsed.message) {
          chunk = parsed.message;
        } else if (typeof parsed === 'string') {
          chunk = parsed;
        }

        if (chunk) {
          content.value += chunk;
          onChunk?.(chunk, content.value);
        }

        onMessage?.({ data, event: parsed.event, id: parsed.id });
      } catch {
        // 非 JSON 格式，直接作为文本处理
        content.value += data;
        onChunk?.(data, content.value);
        onMessage?.({ data });
      }
    } else if (line.startsWith('event:')) {
      // 事件类型行，暂时忽略
    } else if (line.startsWith('id:')) {
      // 消息 ID 行，暂时忽略
    }
  }

  return {
    /** 发起 SSE 请求 */
    start,
    /** 中止请求 */
    abort,
    /** 重置状态 */
    reset,
    /** 当前状态 */
    status,
    /** 累积的内容 */
    content,
    /** 错误信息 */
    error,
    /** 是否正在流式传输 */
    isStreaming,
    /** 是否已完成 */
    isDone,
  };
}

/**
 * 简化的流式聊天请求
 *
 * @example
 * ```ts
 * const { send, abort, content, isStreaming } = useChatStream('/api/chat');
 *
 * // 发送消息
 * await send('你好');
 *
 * // 发送带上下文的消息
 * await send('继续', { history: [...] });
 * ```
 */
export function useChatStream(baseUrl: string) {
  const sse = useSSE();

  async function send(
    message: string,
    options: {
      history?: Array<{ role: string; content: string }>;
      onChunk?: (chunk: string, fullText: string) => void;
      onDone?: (fullText: string) => void;
      onError?: (error: Error) => void;
    } = {}
  ) {
    const { history = [], onChunk, onDone, onError } = options;

    return sse.start(baseUrl, {
      method: 'POST',
      body: {
        message,
        history,
      },
      onChunk,
      onDone,
      onError,
    });
  }

  return {
    /** 发送消息 */
    send,
    /** 中止请求 */
    abort: sse.abort,
    /** 重置状态 */
    reset: sse.reset,
    /** 当前状态 */
    status: sse.status,
    /** 累积的内容 */
    content: sse.content,
    /** 错误信息 */
    error: sse.error,
    /** 是否正在流式传输 */
    isStreaming: sse.isStreaming,
    /** 是否已完成 */
    isDone: sse.isDone,
  };
}
