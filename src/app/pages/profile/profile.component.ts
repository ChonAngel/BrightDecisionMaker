import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get user() {
    return this.authService.currentUser;
  }

  onSignOut(): void {
    this.authService.signOut();
  }

  onBackToApp(): void {
    this.router.navigate(['/']);
  }
}
