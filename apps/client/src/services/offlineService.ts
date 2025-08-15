import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { errorService } from './errorService';

interface OfflineAction {
  id: string;
  type: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
}

interface OfflineQueueConfig {
  maxQueueSize: number;
  maxRetries: number;
  retryDelay: number;
  storageKey: string;
}

class OfflineService {
  private static instance: OfflineService;
  private queue: OfflineAction[] = [];
  private isProcessing: boolean = false;
  private isOnline: boolean = true;
  private config: OfflineQueueConfig = {
    maxQueueSize: 100,
    maxRetries: 3,
    retryDelay: 5000,
    storageKey: '@offline_queue',
  };

  private constructor() {
    this.initialize();
  }

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private async initialize() {
    // Load queue from storage
    await this.loadQueue();

    // Monitor network status
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        // Connection restored, process queue
        this.processQueue();
      }
    });

    // Check initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;

    if (this.isOnline && this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Add action to offline queue
   */
  public async addToQueue(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) {
    if (this.queue.length >= this.config.maxQueueSize) {
      // Remove oldest low-priority items
      this.queue = this.queue
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            const priorityOrder = { high: 0, normal: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return b.timestamp - a.timestamp;
        })
        .slice(0, this.config.maxQueueSize - 1);
    }

    const queuedAction: OfflineAction = {
      ...action,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: action.maxRetries || this.config.maxRetries,
    };

    this.queue.push(queuedAction);
    await this.saveQueue();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueue();
    }

    return queuedAction.id;
  }

  /**
   * Process offline queue
   */
  private async processQueue() {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // Sort queue by priority and timestamp
    const sortedQueue = [...this.queue].sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.timestamp - b.timestamp;
    });

    for (const action of sortedQueue) {
      try {
        await this.executeAction(action);
        // Remove successful action from queue
        this.queue = this.queue.filter((a) => a.id !== action.id);
        await this.saveQueue();
      } catch (error) {
        // Handle retry logic
        await this.handleFailedAction(action, error);
      }

      // Check if still online
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        this.isOnline = false;
        break;
      }
    }

    this.isProcessing = false;

    // Continue processing if there are more items
    if (this.queue.length > 0 && this.isOnline) {
      setTimeout(() => this.processQueue(), this.config.retryDelay);
    }
  }

  /**
   * Execute a queued action
   */
  private async executeAction(action: OfflineAction): Promise<any> {
    const response = await fetch(action.endpoint, {
      method: action.method,
      headers: {
        'Content-Type': 'application/json',
        ...action.headers,
      },
      body: action.payload ? JSON.stringify(action.payload) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Handle failed action
   */
  private async handleFailedAction(action: OfflineAction, error: any) {
    action.retryCount++;

    if (action.retryCount >= action.maxRetries) {
      // Max retries reached, remove from queue
      this.queue = this.queue.filter((a) => a.id !== action.id);
      await this.saveQueue();

      // Log error
      errorService.logError(error, {
        action,
        message: 'Offline action failed after max retries',
      });
    } else {
      // Update retry count in queue
      const index = this.queue.findIndex((a) => a.id === action.id);
      if (index !== -1) {
        this.queue[index].retryCount = action.retryCount;
        await this.saveQueue();
      }
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue() {
    try {
      await AsyncStorage.setItem(this.config.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      errorService.logError(error, { message: 'Failed to save offline queue' });
    }
  }

  /**
   * Load queue from storage
   */
  private async loadQueue() {
    try {
      const data = await AsyncStorage.getItem(this.config.storageKey);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch (error) {
      errorService.logError(error, { message: 'Failed to load offline queue' });
      this.queue = [];
    }
  }

  /**
   * Clear offline queue
   */
  public async clearQueue() {
    this.queue = [];
    await AsyncStorage.removeItem(this.config.storageKey);
  }

  /**
   * Get queue status
   */
  public getQueueStatus() {
    return {
      isOnline: this.isOnline,
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      queue: this.queue.map((action) => ({
        id: action.id,
        type: action.type,
        timestamp: action.timestamp,
        retryCount: action.retryCount,
        priority: action.priority,
      })),
    };
  }

  /**
   * Remove specific action from queue
   */
  public async removeFromQueue(actionId: string) {
    this.queue = this.queue.filter((a) => a.id !== actionId);
    await this.saveQueue();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configure offline service
   */
  public configure(config: Partial<OfflineQueueConfig>) {
    this.config = { ...this.config, ...config };
  }
}

export const offlineService = OfflineService.getInstance();
export default offlineService;