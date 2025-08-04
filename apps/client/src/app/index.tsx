import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadAuthState } = useAuthStore();

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  const navigateToEvents = () => {
    router.push('/(tabs)/events');
  };

  const navigateToAuth = () => {
    // Navigate to login page in auth flow
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563EB" testID="loading-indicator" />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  // If user is already authenticated, redirect to events
  if (isAuthenticated) {
    router.replace('/(tabs)/events');
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JCTOP Event Management</Text>
      <Text style={styles.subtitle}>歡迎使用 JCTOP 活動管理平台</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={navigateToEvents}>
          <Text style={styles.buttonText}>瀏覽活動</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={navigateToAuth}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>登入 / 註冊</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#2563EB',
  },
});