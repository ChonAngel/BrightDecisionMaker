import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent)
  },
  {
    path: 'saved-lists',
    loadComponent: () => import('./pages/saved-lists/saved-lists.component').then(m => m.SavedListsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
