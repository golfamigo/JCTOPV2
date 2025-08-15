import { useEffect, useState } from 'react';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  details: any;
}

export class NetworkStatusManager {
  private static instance: NetworkStatusManager;
  private listeners: Map<string, (status: NetworkStatus) => void> = new Map();
  private currentStatus: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: null,
  };

  private constructor() {
    // For now, assume we're always connected
    // This can be enhanced later with proper network detection
  }

  public static getInstance(): NetworkStatusManager {
    if (!NetworkStatusManager.instance) {
      NetworkStatusManager.instance = new NetworkStatusManager();
    }
    return NetworkStatusManager.instance;
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => {
      callback(this.currentStatus);
    });
  }

  public addListener(id: string, callback: (status: NetworkStatus) => void) {
    this.listeners.set(id, callback);
  }

  public removeListener(id: string) {
    this.listeners.delete(id);
  }

  public getCurrentStatus(): NetworkStatus {
    return this.currentStatus;
  }

  public async checkConnection(): Promise<NetworkStatus> {
    // Simple mock implementation - in production this would check actual connectivity
    return this.currentStatus;
  }

  public dispose() {
    this.listeners.clear();
  }

  // Method to simulate connection changes for testing
  public setConnectionStatus(isConnected: boolean) {
    const previousStatus = this.currentStatus.isConnected;
    this.currentStatus = {
      ...this.currentStatus,
      isConnected,
      isInternetReachable: isConnected,
    };

    if (previousStatus !== isConnected) {
      this.notifyListeners();
    }
  }
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => {
    return NetworkStatusManager.getInstance().getCurrentStatus();
  });

  useEffect(() => {
    const manager = NetworkStatusManager.getInstance();
    const listenerId = `hook-${Date.now()}-${Math.random()}`;

    manager.addListener(listenerId, (status) => {
      setNetworkStatus(status);
    });

    return () => {
      manager.removeListener(listenerId);
    };
  }, []);

  return networkStatus;
};

export const getNetworkErrorMessage = (error: any, isConnected: boolean): string => {
  if (!isConnected) {
    return 'errors.offline';
  }

  if (error?.response) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return 'errors.badRequest';
      case 401:
        return 'errors.unauthorized';
      case 403:
        return 'errors.forbidden';
      case 404:
        return 'errors.notFound';
      case 408:
        return 'errors.timeout';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'errors.serverError';
      default:
        return 'errors.unknownError';
    }
  }

  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'errors.timeout';
  }

  if (error?.code === 'ERR_NETWORK' || error?.code === 'ENOTFOUND') {
    return 'errors.networkError';
  }

  return 'errors.unknownError';
};