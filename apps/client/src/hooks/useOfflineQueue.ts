import { useState, useEffect, useCallback } from 'react';
import { offlineService } from '../services/offlineService';
import { useNetworkStatus } from './useNetworkStatus';

interface OfflineQueueOptions {
  autoSync?: boolean;
  onSync?: () => void;
  onError?: (error: any) => void;
}

export const useOfflineQueue = (options: OfflineQueueOptions = {}) => {
  const { autoSync = true, onSync, onError } = options;
  const { isConnected } = useNetworkStatus();
  const [queueStatus, setQueueStatus] = useState(offlineService.getQueueStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Update queue status periodically
    const interval = setInterval(() => {
      setQueueStatus(offlineService.getQueueStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto sync when connection is restored
    if (autoSync && isConnected && queueStatus.queueLength > 0 && !isSyncing) {
      syncQueue();
    }
  }, [isConnected, queueStatus.queueLength, autoSync]);

  const addToQueue = useCallback(async (action: {
    type: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    payload?: any;
    headers?: Record<string, string>;
    priority?: 'low' | 'normal' | 'high';
  }) => {
    try {
      const actionId = await offlineService.addToQueue({
        ...action,
        priority: action.priority || 'normal',
        maxRetries: 3,
      });
      setQueueStatus(offlineService.getQueueStatus());
      return actionId;
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  const removeFromQueue = useCallback(async (actionId: string) => {
    try {
      await offlineService.removeFromQueue(actionId);
      setQueueStatus(offlineService.getQueueStatus());
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  const clearQueue = useCallback(async () => {
    try {
      await offlineService.clearQueue();
      setQueueStatus(offlineService.getQueueStatus());
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  const syncQueue = useCallback(async () => {
    if (!isConnected || isSyncing) {
      return;
    }

    setIsSyncing(true);
    try {
      // Trigger manual sync
      if (onSync) {
        onSync();
      }
      // The offline service will handle the actual sync
      // We just update the UI state
      setQueueStatus(offlineService.getQueueStatus());
    } catch (error) {
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected, isSyncing, onSync, onError]);

  return {
    queueStatus,
    addToQueue,
    removeFromQueue,
    clearQueue,
    syncQueue,
    isSyncing,
    isOnline: isConnected,
    queueLength: queueStatus.queueLength,
    hasQueuedActions: queueStatus.queueLength > 0,
  };
};

export default useOfflineQueue;