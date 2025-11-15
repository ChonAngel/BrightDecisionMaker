import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
  provider?: 'google' | 'microsoft';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<UserProfile | null>(null);
  currentUser = this.currentUserSignal.asReadonly();
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private msalInstance: PublicClientApplication | null = null;
  private msalInitialized = false;

  constructor(private router: Router) {
    this.loadUserFromStorage();
    this.initializeMsal();
  }

  private async initializeMsal(): Promise<void> {
    if (!this.isBrowser) return;

    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: '9f31697a-b36a-4e2c-85b5-607d9c4283f4',
        authority: 'https://login.microsoftonline.com/b210c743-80a7-4519-985b-d870f711a83e',
        redirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      }
    });

    try {
      await this.msalInstance.initialize();
      this.msalInitialized = true;
    } catch (error) {
      console.error('MSAL initialization error:', error);
    }
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSignal.set(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  async signInWithGoogle(googleUser: any): Promise<void> {
    const profile = googleUser.getBasicProfile();
    const user: UserProfile = {
      id: profile.getId(),
      email: profile.getEmail(),
      name: profile.getName(),
      photoUrl: profile.getImageUrl(),
      firstName: profile.getGivenName(),
      lastName: profile.getFamilyName(),
      provider: 'google'
    };

    this.currentUserSignal.set(user);
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.router.navigate(['/']);
  }

  async signInWithMicrosoft(): Promise<void> {
    if (!this.isBrowser || !this.msalInstance) {
      throw new Error('MSAL not available');
    }

    // Wait for MSAL to be initialized if not yet
    if (!this.msalInitialized) {
      await this.initializeMsal();
    }

    if (!this.msalInitialized) {
      throw new Error('Failed to initialize MSAL');
    }

    try {
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: ['user.read'],
        prompt: 'select_account'
      });

      if (loginResponse.account) {
        const account = loginResponse.account;
        const user: UserProfile = {
          id: account.localAccountId,
          email: account.username,
          name: account.name || account.username,
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name || account.username)}&background=A8E6CF&color=fff&size=200`,
          firstName: account.name?.split(' ')[0] || '',
          lastName: account.name?.split(' ').slice(1).join(' ') || '',
          provider: 'microsoft'
        };

        this.currentUserSignal.set(user);
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const currentUser = this.currentUser();
    this.currentUserSignal.set(null);
    
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    
    // Sign out based on provider
    if (currentUser?.provider === 'google') {
      // Sign out from Google
      if (this.isBrowser && typeof (window as any).gapi !== 'undefined' && (window as any).gapi.auth2) {
        const auth2 = (window as any).gapi.auth2.getAuthInstance();
        if (auth2) {
          auth2.signOut();
        }
      }
    } else if (currentUser?.provider === 'microsoft') {
      // Sign out from Microsoft
      if (this.msalInstance) {
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          await this.msalInstance.logoutPopup({
            account: accounts[0]
          });
        }
      }
    }
    
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
