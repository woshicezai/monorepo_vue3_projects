interface WebSocketOptions {
  url: string
  heartbeatMode?: 'active' | 'passive' // 心跳模式：主动发送ping或被动接收ping，默认active（主动）
  heartbeatInterval?: number // 心跳间隔，默认 30s
  heartbeatTimeout?: number // 心跳超时时间，默认 5s
  reconnectInterval?: number // 重连间隔，默认 5s
  reconnectTimes?: number // 最大重连次数，默认 5次
  bufferSize?: number // 缓冲池大小，默认 1000条
  bufferTimeout?: number // 缓冲池清空间隔，默认 1s
  onStatusChange?: (connected: boolean) => void
  onError?: (error: Error) => void
}

interface MessageBuffer<T> {
  timestamp: number
  data: T
}

type SubscribeCallback<T> = (data: T[]) => void

export class WebSocketClient<T = any> {
  private ws: WebSocket | null = null
  private options: Required<WebSocketOptions>
  private reconnectCount = 0
  private heartbeatTimer: NodeJS.Timeout | null = null
  private heartbeatTimeoutTimer: NodeJS.Timeout | null = null
  private bufferTimer: NodeJS.Timeout | null = null
  private messageBuffer: MessageBuffer<T>[] = []
  private isConnecting = false
  private isConnected = false
  private subscribers: SubscribeCallback<T>[] = []

  private connectedResolve: (() => void) | null = null
  private connectedReject: (() => void) | null = null

  constructor(options: WebSocketOptions) {
    this.options = {
      heartbeatMode: 'active',
      heartbeatInterval: 30000,
      heartbeatTimeout: 5000,
      reconnectInterval: 5000,
      reconnectTimes: 5,
      bufferSize: 1000,
      bufferTimeout: 1000,
      onStatusChange: () => {},
      onError: () => {},
      ...options,
    }
    this.startBufferProcessor()
  }

  private startBufferProcessor(): void {
    this.bufferTimer = setInterval(() => {
      this.processBuffer()
    }, this.options.bufferTimeout)
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connectedResolve = resolve
      this.connectedReject = reject
      if (this.isConnecting || this.isConnected) return
      this.isConnecting = true
      this.ws = new WebSocket(this.options.url)
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
    })
  }

  public disconnect(): void {
    this.cleanup()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  public send(data: any): void {
    if (!this.isConnected) {
      throw new Error('WebSocket is not connected')
    }
    this.ws?.send(typeof data === 'string' ? data : JSON.stringify(data))
  }

  public subscribe(callback: SubscribeCallback<T>): () => void {
    this.subscribers.push(callback)

    // 返回取消订阅函数
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  private notifySubscribers(data: T[]): void {
    this.subscribers.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in subscriber callback:', error)
      }
    })
  }

  private handleOpen(): void {
    this.isConnected = true
    this.isConnecting = false
    this.reconnectCount = 0
    this.options.onStatusChange?.(true)
    this.startHeartbeat()
    this.connectedResolve?.()
  }

  private handleClose(): void {
    this.isConnected = false
    this.options.onStatusChange?.(false)
    this.cleanup()
    this.reconnect()
    this.connectedReject?.()
  }

  private handleError(event: Event): void {
    const error = new Error('WebSocket error')
    this.options.onError?.(error)
    /*   this.isConnected = false
    this.options.onStatusChange?.(false)
    this.cleanup()
    this.reconnect() */
    this.handleClose()
  }

  private handleMessage(event: MessageEvent): void {
    try {
      // 处理心跳消息
      if (event.data === 'ping') {
        this.handleHeartbeat()
        this.send('pong')
        return
      }
      if (event.data === 'pong') {
        this.handleHeartbeat()
        return
      }

      const data = JSON.parse(event.data) as T
      this.addToBuffer(data)
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err)
    }
  }

  private handleHeartbeat(): void {
    // 重置心跳超时计时器
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
    }
    if (this.options.heartbeatMode === 'passive') {
      this.startHeartbeatTimeout()
    }
  }

  private startHeartbeat(): void {
    if (this.options.heartbeatMode === 'active') {
      // 主动模式：定时发送 ping
      this.heartbeatTimer = setInterval(() => {
        if (this.isConnected) {
          this.send('ping')
          this.startHeartbeatTimeout()
        }
      }, this.options.heartbeatInterval)
    } else {
      // 被动模式：监听服务器的 ping
      this.startHeartbeatTimeout()
    }
  }

  private startHeartbeatTimeout(): void {
    this.heartbeatTimeoutTimer = setTimeout(() => {
      console.log('Heartbeat timeout, reconnecting...')
      this.handleHeartbeatTimeout()
    }, this.options.heartbeatTimeout)
  }

  private handleHeartbeatTimeout(): void {
    // 心跳超时，认为连接已断开
    this.isConnected = false
    this.options.onStatusChange?.(false)
    this.cleanup()
    this.reconnect()
  }

  private addToBuffer(data: T): void {
    this.messageBuffer.push({
      timestamp: Date.now(),
      data,
    })

    // 如果缓冲区超过最大大小，立即处理
    if (this.messageBuffer.length >= this.options.bufferSize) {
      this.processBuffer()
    }
  }

  private processBuffer(): void {
    if (this.messageBuffer.length === 0) return

    const messages = this.messageBuffer.map(item => item.data)
    this.messageBuffer = [] // 清空缓冲池

    // 通知所有订阅者
    this.notifySubscribers(messages)
  }

  private reconnect(): void {
    if (this.isConnecting || this.reconnectCount >= this.options.reconnectTimes) return

    this.reconnectCount++
    console.log(
      `Attempting to reconnect... (${this.reconnectCount}/${this.options.reconnectTimes})`
    )

    setTimeout(() => {
      this.connect()
    }, this.options.reconnectInterval)
  }

  private cleanup(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
    if (this.bufferTimer) {
      clearInterval(this.bufferTimer)
      this.bufferTimer = null
    }
    this.isConnecting = false
  }
}

export const createWebSocket = <T>(options: WebSocketOptions) => {
  return new WebSocketClient<T>(options)
}
