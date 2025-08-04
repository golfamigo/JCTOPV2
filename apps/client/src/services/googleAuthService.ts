import { Linking } from 'react-native';
import * as AuthSession from 'expo-auth-session';

export interface GoogleAuthResult {
  success: boolean;
  accessToken?: string;
  error?: string;
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private authPromiseResolve: ((result: GoogleAuthResult) => void) | null = null;

  private constructor() {
    // Set up deep link listener
    this.setupDeepLinkListener();
  }

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  private setupDeepLinkListener(): void {
    // Handle deep links when app is already running
    Linking.addEventListener('url', this.handleDeepLink);

    // Handle deep links when app is launched from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleDeepLink({ url });
      }
    });
  }

  private handleDeepLink = ({ url }: { url: string }) => {
    if (url.startsWith('com.jctopevent.client://auth/callback')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const success = urlParams.get('success') === 'true';
      const accessToken = urlParams.get('token');
      const error = urlParams.get('error');

      if (this.authPromiseResolve) {
        this.authPromiseResolve({
          success,
          accessToken: accessToken || undefined,
          error: error || undefined,
        });
        this.authPromiseResolve = null;
      }
    }
  };

  public async signInWithGoogle(): Promise<GoogleAuthResult> {
    return new Promise((resolve, reject) => {
      // Store the resolve function to call when deep link is received
      this.authPromiseResolve = resolve;

      // Redirect to backend Google OAuth endpoint
      const authUrl = `${process.env.EXPO_PUBLIC_API_URL || 'https://jctop.zeabur.app/api/v1'}/auth/google`;
      
      Linking.openURL(authUrl).catch((error) => {
        this.authPromiseResolve = null;
        reject(new Error(`Failed to open Google sign-in: ${error.message}`));
      });

      // Set a timeout in case the user cancels or something goes wrong
      setTimeout(() => {
        if (this.authPromiseResolve) {
          this.authPromiseResolve({
            success: false,
            error: 'Authentication timeout',
          });
          this.authPromiseResolve = null;
        }
      }, 300000); // 5 minute timeout
    });
  }

  public cleanup(): void {
    Linking.removeAllListeners('url');
  }
}

export default GoogleAuthService.getInstance();