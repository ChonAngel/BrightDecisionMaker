import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { StateService } from '../../services/state.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar class="header-toolbar">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="logo-text">
            <span class="bright">Bright</span>
            <span class="decision">Decision</span>
            <span class="maker">Maker</span>
          </h1>
        </div>
        
        <div class="header-actions">
          <button
            mat-icon-button
            [matMenuTriggerFor]="themeMenu"
            class="theme-button"
            aria-label="Change theme"
            title="Change theme"
          >
            <mat-icon>palette</mat-icon>
          </button>
          
          <mat-menu #themeMenu="matMenu" class="theme-menu">
            @for (theme of stateService.themeConfigs; track theme.name) {
              <button
                mat-menu-item
                (click)="stateService.setTheme(theme.name)"
                class="theme-menu-item"
                [class.active]="stateService.currentTheme() === theme.name"
              >
                <div class="theme-option">
                  <div 
                    class="theme-color-preview"
                    [style.background]="theme.primary"
                  ></div>
                  <span class="theme-name">{{ theme.displayName }}</span>
                  @if (stateService.currentTheme() === theme.name) {
                    <mat-icon class="check-icon">check</mat-icon>
                  }
                </div>
              </button>
            }
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      background: var(--gradient-primary);
      color: white;
      box-shadow: var(--shadow-md);
      position: sticky;
      top: 0;
      z-index: 1000;
      min-height: 80px;
      padding: 0;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
    }

    .logo-section {
      display: flex;
      align-items: center;
    }

    .logo-text {
      font-family: 'Poppins', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      
      .bright {
        color: #FFFFFF;
      }
      
      .decision {
        color: #FFE4E1;
        margin: 0 4px;
      }
      
      .maker {
        color: #FFFFFF;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .theme-button {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--border-radius-lg);
      color: white;
      transition: all var(--animation-normal) ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
      }
      
      mat-icon {
        font-size: 1.4rem;
      }
    }

    .theme-menu {
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-xl);
    }

    .theme-menu-item {
      padding: var(--spacing-sm) var(--spacing-md);
      
      &.active {
        background-color: var(--primary-color);
        color: white;
      }
      
      &:hover:not(.active) {
        background-color: var(--secondary-color);
      }
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      width: 100%;
    }

    .theme-color-preview {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }

    .theme-name {
      flex: 1;
      font-weight: 500;
    }

    .check-icon {
      font-size: 1.2rem;
      margin-left: auto;
    }

    // Responsive design
    @media (max-width: 768px) {
      .header-content {
        padding: 0 var(--spacing-md);
      }
      
      .logo-text {
        font-size: 1.4rem;
        
        .decision {
          margin: 0 2px;
        }
      }
      
      .theme-button {
        width: 40px;
        height: 40px;
        
        mat-icon {
          font-size: 1.2rem;
        }
      }
    }

    @media (max-width: 480px) {
      .logo-text {
        font-size: 1.2rem;
      }
      
      .header-content {
        padding: 0 var(--spacing-sm);
      }
    }
  `]
})
export class HeaderComponent {
  protected readonly stateService = inject(StateService);
  private readonly themeService = inject(ThemeService);
}