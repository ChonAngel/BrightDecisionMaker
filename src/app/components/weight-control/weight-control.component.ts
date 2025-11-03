import { Component, Input, Output, EventEmitter, signal, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-weight-control',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="weight-control" [attr.aria-label]="'Weight control, current value: ' + weight()">
      <button
        mat-mini-fab
        color="primary"
        class="weight-button decrease"
        (click)="decreaseWeight()"
        [disabled]="weight() <= 1"
        [attr.aria-label]="'Decrease weight, current: ' + weight()"
        matTooltip="Decrease weight"
        matTooltipPosition="above"
      >
        <mat-icon>remove</mat-icon>
      </button>
      
      <div class="weight-display">
        <div class="weight-number" [attr.aria-live]="'polite'">{{ weight() }}</div>
        <div class="weight-stars" [attr.aria-label]="weight() + ' out of 5 stars'">
          @for (star of stars(); track $index) {
            <mat-icon 
              class="star" 
              [class.filled]="star"
              [attr.aria-hidden]="true"
            >
              {{ star ? 'star' : 'star_border' }}
            </mat-icon>
          }
        </div>
        <div class="weight-label">Weight</div>
      </div>
      
      <button
        mat-mini-fab
        color="primary"
        class="weight-button increase"
        (click)="increaseWeight()"
        [disabled]="weight() >= 5"
        [attr.aria-label]="'Increase weight, current: ' + weight()"
        matTooltip="Increase weight"
        matTooltipPosition="above"
      >
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .weight-control {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm);
      background: var(--surface-color);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 2px solid rgba(0, 0, 0, 0.05);
      transition: all var(--animation-normal) ease;
      
      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
      }
    }

    .weight-button {
      width: 32px;
      height: 32px;
      min-height: 32px;
      transition: all var(--animation-normal) ease;
      
      &:hover:not(:disabled) {
        transform: scale(1.1);
      }
      
      &:disabled {
        opacity: 0.4;
      }
      
      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .weight-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      min-width: 60px;
    }

    .weight-number {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary-color);
      line-height: 1;
    }

    .weight-stars {
      display: flex;
      gap: 1px;
      
      .star {
        font-size: 0.875rem;
        width: 0.875rem;
        height: 0.875rem;
        color: #FFD700;
        transition: all var(--animation-fast) ease;
        
        &.filled {
          text-shadow: 0 1px 2px rgba(255, 215, 0, 0.3);
        }
        
        &:not(.filled) {
          color: #E0E0E0;
        }
      }
    }

    .weight-label {
      font-size: 0.75rem;
      color: var(--text-secondary-color);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    // Responsive design
    @media (max-width: 768px) {
      .weight-control {
        gap: var(--spacing-sm);
        padding: var(--spacing-xs);
      }
      
      .weight-button {
        width: 28px;
        height: 28px;
        min-height: 28px;
        
        mat-icon {
          font-size: 0.875rem;
          width: 0.875rem;
          height: 0.875rem;
        }
      }
      
      .weight-number {
        font-size: 1.125rem;
      }
      
      .weight-stars .star {
        font-size: 0.75rem;
        width: 0.75rem;
        height: 0.75rem;
      }
      
      .weight-label {
        font-size: 0.625rem;
      }
    }
  `]
})
export class WeightControlComponent {
  @Input() set value(val: number) {
    this.weight.set(Math.max(1, Math.min(5, val || 1)));
  }
  get value(): number {
    return this.weight();
  }

  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<number>();

  protected readonly weight = signal(1);
  
  protected readonly stars = signal<boolean[]>([]);

  constructor() {
    // Update stars when weight changes using effect
    effect(() => {
      const currentWeight = this.weight();
      const starArray = Array(5).fill(false);
      for (let i = 0; i < currentWeight; i++) {
        starArray[i] = true;
      }
      this.stars.set(starArray);
    });
  }

  protected increaseWeight(): void {
    if (this.weight() < 5 && !this.disabled) {
      const newWeight = this.weight() + 1;
      this.weight.set(newWeight);
      this.valueChange.emit(newWeight);
    }
  }

  protected decreaseWeight(): void {
    if (this.weight() > 1 && !this.disabled) {
      const newWeight = this.weight() - 1;
      this.weight.set(newWeight);
      this.valueChange.emit(newWeight);
    }
  }
}