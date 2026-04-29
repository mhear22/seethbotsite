/**
 * Network manager for multiplayer mech battle
 * Handles WebSocket connection, message sending/receiving, and event handling
 */

import type {
  ClientMessage,
  ServerMessage,
  InputMessage,
  StateSnapshotMessage,
  EventMessage,
  MatchFoundMessage,
  MatchStartMessage,
  MatchEndMessage,
  OpponentDisconnectedMessage,
  MatchmakingStatusMessage,
  ErrorMessage,
  PlayerInput,
  MechLoadout
} from '@shared/types/NetworkMessages';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type NetworkEventHandler = (event: any) => void;

export class NetworkManager {
  private ws: WebSocket | null = null;
  private connectedEndpoint: string | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // Increased from 5 to 10
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Cap at 30 seconds
  private messageQueue: ClientMessage[] = [];
  private eventHandlers: Map<string, NetworkEventHandler[]> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPingTime = 0;
  private roundTripTime = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastPongTime = 0;
  private connectionHealth = 'unknown'; // 'healthy', 'degraded', 'unhealthy', 'unknown'
  private storedToken: string | null = null;
  private isManualDisconnect = false;

  // For dev mode latency simulation
  public debugLatency = 0;

  /**
   * Connect to multiplayer server
   */
  public async connect(token: string): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      console.warn('[NetworkManager] Already connected or connecting');
      return;
    }

    // Store token for automatic reconnection
    this.storedToken = token;
    this.isManualDisconnect = false;
    this.connectionState = 'connecting';
    const wsUrls = this.getWebSocketUrls(token);

    let socket: WebSocket | null = null;
    let lastError: unknown = null;

    for (const wsUrl of wsUrls) {
      try {
        console.log('[NetworkManager] Connecting to:', wsUrl);
        socket = await this.openWebSocket(wsUrl);
        this.connectedEndpoint = wsUrl;
        break;
      } catch (error) {
        lastError = error;
        console.warn('[NetworkManager] WebSocket endpoint failed:', wsUrl, error);
      }
    }

    if (!socket) {
      this.connectionState = 'error';
      this.emit('error', { error: lastError });
      throw (lastError instanceof Error ? lastError : new Error('Failed to connect to multiplayer server'));
    }

    this.ws = socket;

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onclose = () => {
      console.log('[NetworkManager] Disconnected');
      this.connectionState = 'disconnected';
      this.connectedEndpoint = null;
      this.stopPingLoop();
      this.stopHealthCheck();
      this.emit('disconnected', null);
      
      // Only attempt reconnect if not a manual disconnect
      if (!this.isManualDisconnect && this.storedToken) {
        this.attemptReconnect(this.storedToken);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[NetworkManager] WebSocket error:', error);
      this.connectionState = 'error';
      this.emit('error', { error });
    };

    console.log('[NetworkManager] Connected via:', this.connectedEndpoint);
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.startPingLoop();
    this.startHealthCheck();
    this.flushMessageQueue();
    this.emit('connected', null);
  }

  /**
   * Disconnect from server
   */
  public disconnect(): void {
    this.isManualDisconnect = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectedEndpoint = null;
    this.connectionState = 'disconnected';
    this.stopPingLoop();
    this.stopHealthCheck();
    this.storedToken = null;
  }

  private getWebSocketUrls(token: string): string[] {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const tokenQuery = encodeURIComponent(token);

    return [
      `${protocol}//${host}/ws/mech/multiplayer?token=${tokenQuery}`,
      `${protocol}//${host}/ws/multiplayer?token=${tokenQuery}`
    ];
  }

  private openWebSocket(url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        socket.onopen = null;
        socket.onerror = null;
        socket.onclose = null;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      socket.onopen = () => {
        cleanup();
        resolve(socket);
      };

      socket.onerror = (event) => {
        cleanup();
        socket.close();
        reject(new Error(`WebSocket error while connecting to ${url}: ${String(event)}`));
      };

      socket.onclose = () => {
        cleanup();
        reject(new Error(`WebSocket closed before opening: ${url}`));
      };

      timeoutId = setTimeout(() => {
        cleanup();
        socket.close();
        reject(new Error(`WebSocket connection timeout: ${url}`));
      }, 5000);
    });
  }

  /**
   * Attempt to reconnect with exponential backoff and jitter
   */
  private attemptReconnect(token: string): void {
    if (this.isManualDisconnect) {
      console.log('[NetworkManager] Skipping reconnect - manual disconnect');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[NetworkManager] Max reconnect attempts reached');
      this.emit('reconnect_failed', null);
      return;
    }

    this.reconnectAttempts++;
    
    // Add jitter to prevent thundering herd (random between 0-25% of delay)
    const jitter = Math.random() * this.reconnectDelay * 0.25;
    const actualDelay = this.reconnectDelay + jitter;
    
    console.log(`[NetworkManager] Reconnecting in ${actualDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error('[NetworkManager] Reconnect failed:', error);
        this.emit('reconnect_error', { attempt: this.reconnectAttempts, error });
      });
    }, actualDelay);

    // Exponential backoff with cap
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
  }

  /**
   * Start ping loop for latency measurement
   */
  private startPingLoop(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.lastPingTime = Date.now();
        // Browser WebSocket doesn't expose ping, so we'll use a custom message
        this.send({ type: 'ping' as any });
      }
    }, 2000);
  }

  /**
   * Stop ping loop
   */
  private stopPingLoop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Start health check to monitor connection quality
   */
  private startHealthCheck(): void {
    this.lastPongTime = Date.now();
    this.healthCheckInterval = setInterval(() => {
      const timeSinceLastPong = Date.now() - this.lastPongTime;
      
      // If no pong for 10 seconds, connection is unhealthy
      if (timeSinceLastPong > 10000) {
        this.connectionHealth = 'unhealthy';
        console.warn('[NetworkManager] Connection unhealthy - no pong received for', timeSinceLastPong, 'ms');
        this.emit('connection_health', { health: 'unhealthy', timeSinceLastPong });
        
        // Force reconnect if unhealthy for too long
        if (timeSinceLastPong > 15000 && this.ws) {
          console.warn('[NetworkManager] Forcing reconnect due to unhealthy connection');
          this.ws.close();
        }
      } else if (timeSinceLastPong > 5000) {
        this.connectionHealth = 'degraded';
        this.emit('connection_health', { health: 'degraded', timeSinceLastPong });
      } else {
        this.connectionHealth = 'healthy';
      }
    }, 3000);
  }

  /**
   * Stop health check
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(data: string): Promise<void> {
    // Simulate latency in dev mode
    if (this.debugLatency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.debugLatency));
    }

    try {
      const message: ServerMessage = JSON.parse(data);

      // Handle ping response for latency measurement
      if ((message as any).type === 'pong') {
        this.roundTripTime = Date.now() - this.lastPingTime;
        this.lastPongTime = Date.now(); // Track for health checks
        this.emit('latency_update', { rtt: this.roundTripTime });
        return;
      }

      // Route message to appropriate handler
      switch (message.type) {
        case 'state_snapshot':
          this.emit('state_snapshot', message);
          break;

        case 'event':
          this.emit('game_event', message);
          break;

        case 'match_found':
          this.emit('match_found', message);
          break;

        case 'match_start':
          this.emit('match_start', message);
          break;

        case 'match_end':
          this.emit('match_end', message);
          break;

        case 'opponent_disconnected':
          this.emit('opponent_disconnected', message);
          break;

        case 'matchmaking_status':
          this.emit('matchmaking_status', message);
          break;

        case 'error':
          this.emit('server_error', message);
          console.error('[NetworkManager] Server error:', message);
          break;

        default:
          console.warn('[NetworkManager] Unknown message type:', (message as any).type);
      }
    } catch (error) {
      console.error('[NetworkManager] Failed to parse message:', error);
    }
  }

  /**
   * Send a message to the server
   */
  private send(message: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message for later
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[NetworkManager] Failed to send message:', error);
      this.messageQueue.push(message);
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.send(message);
    }
  }

  /**
   * Request to join matchmaking queue
   */
  public requestMatch(loadout: MechLoadout): void {
    this.send({
      type: 'match_request',
      loadout
    });
  }

  /**
   * Cancel matchmaking request
   */
  public cancelMatchmaking(): void {
    this.send({
      type: 'cancel_matchmaking'
    });
  }

  /**
   * Send player input
   */
  public sendInput(seq: number, input: PlayerInput): void {
    const message: InputMessage = {
      type: 'input',
      seq,
      timestamp: Date.now(),
      input
    };
    this.send(message);
  }

  /**
   * Send acknowledgment for an event
   */
  public sendAck(eventId: string): void {
    this.send({
      type: 'ack',
      eventId
    });
  }

  /**
   * Register event handler
   */
  public on(event: string, handler: NetworkEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Unregister event handler
   */
  public off(event: string, handler: NetworkEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to handlers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`[NetworkManager] Error in event handler for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Get connection state
   */
  public getState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get current round-trip time (latency)
   */
  public getRTT(): number {
    return this.roundTripTime;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  /**
   * Get connection health status
   */
  public getHealth(): string {
    return this.connectionHealth;
  }

  /**
   * Force reconnect (useful when tab becomes visible after being hidden)
   */
  public forceReconnect(): void {
    if (this.storedToken && !this.isManualDisconnect) {
      console.log('[NetworkManager] Force reconnecting...');
      if (this.ws) {
        this.ws.close();
      }
    }
  }
}

// Add Page Visibility API integration for automatic reconnection
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // When tab becomes visible, check if we need to reconnect
      const instance = (window as any).__networkManager;
      if (instance && instance instanceof NetworkManager) {
        const state = instance.getState();
        const health = instance.getHealth();
        
        if (state !== 'connected' || health === 'unhealthy') {
          console.log('[NetworkManager] Tab visible - checking connection');
          instance.forceReconnect();
        }
      }
    }
  });
}
