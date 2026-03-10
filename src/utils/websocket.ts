import { ref } from 'vue';
import type { Ref } from 'vue';

export type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

export interface UseWebSocketOptions {
  /** 自动重连 */
  autoReconnect?: boolean;
  /** 重连次数 */
  reconnectLimit?: number;
  /** 重连间隔（毫秒） */
  reconnectInterval?: number;
  /** 心跳间隔（毫秒），0 表示不发送心跳 */
  heartbeatInterval?: number;
  /** 心跳消息 */
  heartbeatMessage?: string;
  /** 连接成功回调 */
  onOpen?: (event: Event) => void;
  /** 收到消息回调 */
  onMessage?: (event: MessageEvent) => void;
  /** 连接关闭回调 */
  onClose?: (event: CloseEvent) => void;
  /** 连接错误回调 */
  onError?: (event: Event) => void;
}

/**
 * WebSocket 封装
 *
 * 支持自动重连、心跳检测
 *
 * @example
 * ```ts
 * const { status, data, send, open, close } = useWebSocket('ws://localhost:8080', {
 *   autoReconnect: true,
 *   heartbeatInterval: 30000,
 *   onMessage: (event) => {
 *     console.log('收到消息:', event.data);
 *   },
 * });
 *
 * // 发送消息
 * send('Hello');
 * send({ type: 'ping' });
 *
 * // 手动关闭
 * close();
 *
 * // 手动重连
 * open();
 * ```
 */
export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    autoReconnect = true,
    reconnectLimit = 3,
    reconnectInterval = 3000,
    heartbeatInterval = 0,
    heartbeatMessage = 'ping',
    onOpen,
    onMessage,
    onClose,
    onError,
  } = options;

  const status: Ref<WebSocketStatus> = ref('CLOSED');
  const data: Ref<unknown> = ref(null);

  let ws: WebSocket | null = null;
  let reconnectCount = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  /** 清除定时器 */
  function clearTimers() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  /** 开始心跳 */
  function startHeartbeat() {
    if (heartbeatInterval > 0) {
      heartbeatTimer = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(heartbeatMessage);
        }
      }, heartbeatInterval);
    }
  }

  /** 重连 */
  function reconnect() {
    if (!autoReconnect || reconnectCount >= reconnectLimit) {
      return;
    }
    reconnectCount++;
    console.log(`[WebSocket] 正在重连... (${reconnectCount}/${reconnectLimit})`);
    reconnectTimer = setTimeout(() => {
      open();
    }, reconnectInterval);
  }

  /** 打开连接 */
  function open() {
    close();
    status.value = 'CONNECTING';

    ws = new WebSocket(url);

    ws.onopen = (event) => {
      status.value = 'OPEN';
      reconnectCount = 0;
      startHeartbeat();
      onOpen?.(event);
    };

    ws.onmessage = (event) => {
      try {
        data.value = JSON.parse(event.data);
      } catch {
        data.value = event.data;
      }
      onMessage?.(event);
    };

    ws.onclose = (event) => {
      status.value = 'CLOSED';
      clearTimers();
      onClose?.(event);
      if (!event.wasClean) {
        reconnect();
      }
    };

    ws.onerror = (event) => {
      onError?.(event);
    };
  }

  /** 关闭连接 */
  function close(code = 1000, reason?: string) {
    clearTimers();
    reconnectCount = reconnectLimit; // 阻止自动重连
    if (ws) {
      status.value = 'CLOSING';
      ws.close(code, reason);
      ws = null;
    }
  }

  /** 发送消息 */
  function send(message: string | object) {
    if (ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] 连接未打开，无法发送消息');
      return false;
    }
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    ws.send(msg);
    return true;
  }

  return {
    /** 连接状态 */
    status,
    /** 最新收到的数据 */
    data,
    /** 打开连接 */
    open,
    /** 关闭连接 */
    close,
    /** 发送消息 */
    send,
  };
}
