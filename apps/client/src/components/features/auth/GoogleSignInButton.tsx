import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text } from '@rneui/themed';
import { Svg, Path } from 'react-native-svg';
import GoogleAuthService from '../../../services/googleAuthService';
import { useAppTheme } from '../../../theme';

interface GoogleSignInButtonProps {
  onGoogleSignIn: (accessToken: string) => Promise<void>;
  isLoading?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onGoogleSignIn, 
  isLoading = false 
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { colors } = useAppTheme();

  const handlePress = async () => {
    if (isAuthenticating || isLoading) return;

    setIsAuthenticating(true);
    
    try {
      const result = await GoogleAuthService.signInWithGoogle();
      
      if (result.success && result.accessToken) {
        await onGoogleSignIn(result.accessToken);
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Google sign-in was cancelled or failed',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert(
        'Sign In Error',
        'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Google branding guidelines require specific styling for Google sign-in buttons
  const GoogleIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );

  const isButtonDisabled = isLoading || isAuthenticating;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isButtonDisabled}
      style={[
        styles.button,
        {
          backgroundColor: colors.card,
          borderColor: colors.grey4,
        },
        isButtonDisabled && styles.buttonDisabled
      ]}
      activeOpacity={0.7}
    >
      {isButtonDisabled ? (
        <View style={styles.content}>
          <ActivityIndicator size="small" color={colors.grey2} />
          <Text style={[styles.buttonText, { color: colors.grey2 }]}>
            Signing in with Google...
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <GoogleIcon />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Sign in with Google
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export default GoogleSignInButton;