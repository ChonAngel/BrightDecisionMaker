import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { HeaderComponent } from '../../components/header/header.component';
import { StateService } from '../../services/state.service';
import { SavedOptionList } from '../../models/option.model';

@Component({
  selector: 'app-saved-lists',
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    HeaderComponent
  ],
  template: `
    <div class="saved-lists-page">
      <app-header />
      
      <div class="page-content">
        <div class="content-wrapper">
          <!-- Page Header -->
          <div class="page-header">
            <h1 class="page-title">Saved Decision Lists</h1>
            <button
              mat-raised-button
              color="primary"
              routerLink="/"
              class="back-button"
            >
              <mat-icon>arrow_back</mat-icon>
              Back to Main
            </button>
          </div>

          <!-- Saved Lists Grid -->
          @if (stateService.savedLists().length > 0) {
            <div class="lists-grid">
              @for (list of stateService.savedLists(); track list.id) {
                <mat-card class="list-card cute-card">
                  <mat-card-header>
                    <mat-card-title>{{ list.name }}</mat-card-title>
                    <mat-card-subtitle>
                      {{ list.options.length }} options • 
                      Created {{ formatDate(list.createdAt) }}
                    </mat-card-subtitle>
                  </mat-card-header>
                  
                  <mat-card-content>
                    <div class="options-preview">
                      @for (option of list.options.slice(0, 3); track option.id) {
                        <div class="option-preview">
                          <span class="option-text">{{ option.name }}</span>
                          <span class="option-weight">{{ option.weight }}/5</span>
                        </div>
                      }
                      @if (list.options.length > 3) {
                        <div class="more-options">
                          +{{ list.options.length - 3 }} more options
                        </div>
                      }
                    </div>
                  </mat-card-content>
                  
                  <mat-card-actions>
                    <button
                      mat-button
                      color="primary"
                      (click)="loadList(list.id)"
                    >
                      <mat-icon>play_arrow</mat-icon>
                      Load & Spin
                    </button>
                    <button
                      mat-button
                      color="warn"
                      (click)="deleteList(list.id, list.name)"
                    >
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          } @else {
            <!-- Empty State -->
            <div class="empty-state">
              <div class="empty-icon">
                <mat-icon>bookmark_border</mat-icon>
              </div>
              <h2>No Saved Lists Yet</h2>
              <p>Save option lists from the main page to access them here.</p>
              <button
                mat-raised-button
                color="primary"
                routerLink="/"
                class="create-first-button"
              >
                <mat-icon>add</mat-icon>
                Create Your First List
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .saved-lists-page {
      min-height: 100vh;
      background: var(--gradient-secondary);
    }

    .page-content {
      padding: var(--spacing-lg) 0;
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .back-button {
      border-radius: var(--border-radius-lg);
      padding: 0 var(--spacing-lg);
      
      mat-icon {
        margin-right: var(--spacing-sm);
      }
    }

    .lists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--spacing-lg);
      animation: fadeInUp 0.6s ease-out;
    }

    .list-card {
      transition: all var(--animation-normal) ease;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }
    }

    .options-preview {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .option-preview {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--background-color);
      border-radius: var(--border-radius-sm);
      font-size: 0.9rem;
    }

    .option-text {
      flex: 1;
      color: var(--text-color);
    }

    .option-weight {
      color: var(--text-secondary-color);
      font-weight: 500;
    }

    .more-options {
      text-align: center;
      color: var(--text-secondary-color);
      font-style: italic;
      font-size: 0.85rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-2xl);
      text-align: center;
      animation: fadeInScale 0.6s ease-out;
    }

    .empty-icon {
      mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        color: var(--text-secondary-color);
        opacity: 0.5;
      }
    }

    .empty-state h2 {
      font-size: 1.5rem;
      color: var(--text-color);
      margin: 0;
    }

    .empty-state p {
      color: var(--text-secondary-color);
      font-size: 1.1rem;
      margin: 0;
      max-width: 400px;
    }

    .create-first-button {
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-sm) var(--spacing-lg);
      
      mat-icon {
        margin-right: var(--spacing-sm);
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .content-wrapper {
        padding: 0 var(--spacing-md);
      }
      
      .page-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }
      
      .page-title {
        font-size: 2rem;
      }
      
      .lists-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }
      
      .empty-state {
        padding: var(--spacing-xl);
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.75rem;
      }
      
      .empty-state {
        padding: var(--spacing-md);
      }
    }
  `]
})
export class SavedListsComponent {
  protected readonly stateService = inject(StateService);

  protected loadList(listId: string): void {
    this.stateService.loadSavedList(listId);
    // Navigate back to main page
    window.location.href = '/';
  }

  protected deleteList(listId: string, listName: string): void {
    if (confirm(`Are you sure you want to delete "${listName}"?`)) {
      this.stateService.deleteSavedList(listId);
    }
  }

  protected formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'today';
    } else if (diffDays === 2) {
      return 'yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}