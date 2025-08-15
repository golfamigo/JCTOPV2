import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export function useAdminAuth() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  // Temporary implementation until backend adds role field
  // For now, we'll use email domain or a feature flag
  const isAdmin = useCallback(() => {
    if (!user) return false;
    
    // Temporary admin check - replace when role field is added
    // Check if user email ends with admin domain or is in admin list
    const adminEmails = [
      'admin@jctop.com',
      'platform@jctop.com',
    ];
    
    const isAdminEmail = adminEmails.includes(user.email.toLowerCase());
    const isAdminDomain = user.email.toLowerCase().endsWith('@jctop-admin.com');
    
    return isAdminEmail || isAdminDomain;
  }, [user]);

  const checkAdminAccess = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (!user) {
        router.replace('/auth/login');
        return false;
      }

      const hasAccess = isAdmin();
      
      if (!hasAccess) {
        // Redirect non-admin users to main app
        router.replace('/(tabs)/events');
        return false;
      }

      return true;
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  return {
    isAdmin: isAdmin(),
    isLoading,
    checkAdminAccess,
    user,
  };
}