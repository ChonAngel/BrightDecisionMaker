import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent),
    canActivate: [authGuard]
  },
  {
    path: 'saved-lists',
    loadComponent: () => import('./pages/saved-lists/saved-lists.component').then(m => m.SavedListsComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
