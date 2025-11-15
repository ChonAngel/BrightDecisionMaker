import { Component, OnInit, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Only run in browser
    if (!this.isBrowser) return;

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    // Initialize Google Sign-In
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    if (!this.isBrowser) return;

    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: '69311001517-jbc2q537nvs0ol5mk1iim2r0m7nkenmf.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { 
          theme: 'outline', 
          size: 'large',
          width: 280,
          text: 'signin_with',
          shape: 'pill'
        }
      );
    } else {
      setTimeout(() => this.initializeGoogleSignIn(), 100);
    }
  }

  private async handleCredentialResponse(response: any): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Decode JWT token from Google
      const payload = this.parseJwt(response.credential);
      
      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        photoUrl: payload.picture,
        firstName: payload.given_name,
        lastName: payload.family_name
      };

      // Store user in AuthService
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      (this.authService as any).currentUserSignal.set(user);
      
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage.set('Failed to sign in. Please try again.');
      this.isLoading.set(false);
    }
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  async onMicrosoftSignIn(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.signInWithMicrosoft();
    } catch (error) {
      console.error('Microsoft login error:', error);
      this.errorMessage.set('Failed to sign in with Microsoft. Please try again.');
      this.isLoading.set(false);
    }
  }
}
