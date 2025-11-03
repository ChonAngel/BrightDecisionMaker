import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HeaderComponent } from '../../components/header/header.component';
import { OptionInputComponent } from '../../components/option-input/option-input.component';
import { SpinWheelComponent } from '../../components/spin-wheel/spin-wheel.component';
import { StateService } from '../../services/state.service';
import { ThemeService } from '../../services/theme.service';
import { DecisionOption, SpinResult } from '../../models/option.model';

@Component({
  selector: 'app-main',
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    HeaderComponent,
    OptionInputComponent,
    SpinWheelComponent
  ],
  template: `
    <div class="main-page">
      <app-header />
      
      <div class="page-content">
        <div class="content-wrapper">
          <!-- Page Title and Navigation -->
          <div class="page-header">
            <h1 class="page-title">Make Your Decision</h1>
            <div class="page-actions">
              <button
                mat-raised-button
                color="accent"
                routerLink="/saved-lists"
                class="saved-lists-button"
              >
                <mat-icon>bookmark</mat-icon>
                Saved Lists
              </button>
              
              @if (stateService.currentOptions().length > 0) {
                <button
                  mat-raised-button
                  color="primary"
                  (click)="saveCurrentList()"
                  class="save-button"
                >
                  <mat-icon>save</mat-icon>
                  Save List
                </button>
              }
            </div>
          </div>

          <!-- Options Input Section -->
          <section class="options-section">
            <app-option-input
              (optionAdded)="onOptionAdded($event)"
            />
          </section>

          <!-- Current Options Display -->
          @if (stateService.currentOptions().length > 0) {
            <section class="current-options-section">
              <h2>Your Options ({{ stateService.currentOptions().length }})</h2>
              <div class="options-grid">
                @for (option of stateService.currentOptions(); track option.id; let i = $index) {
                  <div class="option-card cute-card">
                    <div class="option-content">
                      <span class="option-text">{{ option.name }}</span>
                      <div class="option-weight">
                        <span class="weight-label">Weight:</span>
                        <div class="weight-stars">
                          @for (star of getStarsArray(option.weight); track $index) {
                            <span class="star">⭐</span>
                          }
                        </div>
                        <span class="weight-number">{{ option.weight }}/5</span>
                      </div>
                    </div>
                    <div class="option-actions">
                      <button
                        mat-icon-button
                        color="warn"
                        (click)="removeOption(option.id)"
                        [attr.aria-label]="'Remove option: ' + option.name"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>
              
              @if (stateService.currentOptions().length > 0) {
                <div class="clear-all-section">
                  <button
                    mat-stroked-button
                    color="warn"
                    (click)="clearAllOptions()"
                    class="clear-all-button"
                  >
                    <mat-icon>clear_all</mat-icon>
                    Clear All Options
                  </button>
                </div>
              }
            </section>
          }

          <!-- Spin Wheel Section -->
          <section class="wheel-section">
            <app-spin-wheel
              [options]="stateService.currentOptions()"
              (spinComplete)="onSpinComplete($event)"
            />
          </section>
          
          <!-- Quick Stats -->
          @if (stateService.currentOptions().length > 0) {
            <section class="stats-section cute-card">
              <h3>Quick Stats</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Total Options</span>
                  <span class="stat-value">{{ stateService.optionsCount() }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Weight</span>
                  <span class="stat-value">{{ stateService.totalWeight() }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Can Spin</span>
                  <span class="stat-value">{{ stateService.canSpin() ? 'Yes' : 'No' }}</span>
                </div>
              </div>
            </section>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-page {
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

    .page-actions {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .saved-lists-button,
    .save-button {
      border-radius: var(--border-radius-lg);
      padding: 0 var(--spacing-lg);
      
      mat-icon {
        margin-right: var(--spacing-sm);
      }
    }

    .options-section,
    .current-options-section,
    .wheel-section,
    .stats-section {
      animation: fadeInUp 0.6s ease-out;
    }

    .current-options-section {
      h2 {
        font-size: 1.5rem;
        color: var(--text-color);
        margin-bottom: var(--spacing-lg);
        text-align: center;
      }
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .option-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--surface-color);
      border-left: 4px solid var(--primary-color);
    }

    .option-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .option-text {
      font-weight: 500;
      font-size: 1.1rem;
      color: var(--text-color);
    }

    .option-weight {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: 0.9rem;
      color: var(--text-secondary-color);
    }

    .weight-stars {
      display: flex;
      gap: 2px;
      
      .star {
        font-size: 0.8rem;
      }
    }

    .option-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .clear-all-section {
      display: flex;
      justify-content: center;
      
      .clear-all-button {
        border-radius: var(--border-radius-lg);
        
        mat-icon {
          margin-right: var(--spacing-sm);
        }
      }
    }

    .wheel-section {
      background: var(--surface-color);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-lg);
      margin: var(--spacing-xl) 0;
    }

    .stats-section {
      h3 {
        text-align: center;
        margin-bottom: var(--spacing-md);
        color: var(--primary-color);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--spacing-md);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      
      .stat-label {
        font-size: 0.875rem;
        color: var(--text-secondary-color);
        margin-bottom: var(--spacing-xs);
      }
      
      .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--primary-color);
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
      
      .page-actions {
        justify-content: center;
      }
      
      .options-grid {
        grid-template-columns: 1fr;
      }
      
      .option-card {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
        
        .option-actions {
          justify-content: center;
        }
      }
      
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.75rem;
      }
      
      .wheel-section {
        padding: var(--spacing-md);
        margin: var(--spacing-md) 0;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
      }
    }
  `]
})
export class MainComponent {
  protected readonly stateService = inject(StateService);
  private readonly themeService = inject(ThemeService);

  protected onOptionAdded(option: DecisionOption): void {
    this.stateService.addOption(option.name, option.weight);
  }

  protected removeOption(id: string): void {
    this.stateService.removeOption(id);
  }

  protected clearAllOptions(): void {
    if (confirm('Are you sure you want to clear all options?')) {
      this.stateService.clearOptions();
    }
  }

  protected onSpinComplete(result: SpinResult): void {
    // Handle spin completion - could trigger celebrations, etc.
    console.log('Spin completed:', result);
  }

  protected saveCurrentList(): void {
    const name = prompt('Enter a name for this list:');
    if (name && name.trim()) {
      this.stateService.saveCurrentList(name.trim());
      alert('List saved successfully!');
    }
  }

  protected getStarsArray(weight: number): number[] {
    return Array(weight).fill(0);
  }
}