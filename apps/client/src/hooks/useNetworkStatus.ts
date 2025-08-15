import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  isWifi: boolean;
  isCellular: boolean;
  details: NetInfoState | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: NetInfoStateType.unknown,
    isWifi: false,
    isCellular: false,
    details: null,
  });

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === NetInfoStateType.wifi,
        isCellular: state.type === NetInfoStateType.cellular,
        details: state,
      });
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === NetInfoStateType.wifi,
        isCellular: state.type === NetInfoStateType.cellular,
        details: state,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
};

// Hook for simple connected/disconnected status
export const useIsConnected = (): boolean => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
};

// Hook for internet reachability (not just local network)
export const useInternetReachability = (): boolean | null => {
  const [isReachable, setIsReachable] = useState<boolean | null>(true);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      setIsReachable(state.isInternetReachable);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsReachable(state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isReachable;
};

export default useNetworkStatus;