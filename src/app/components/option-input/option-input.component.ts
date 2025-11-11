import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WeightControlComponent } from '../weight-control/weight-control.component';
import { DecisionOption } from '../../models/option.model';

@Component({
  selector: 'app-option-input',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    WeightControlComponent
  ],
  template: `
    <div class="option-input-container">
      <div class="input-section">
        <mat-form-field appearance="outline" class="option-text-field">
          <mat-label>Add an option</mat-label>
          <input
            matInput
            [formControl]="textControl"
            placeholder="e.g., Go for a walk"
            maxlength="100"
            (keyup.enter)="addOption()"
            [attr.aria-label]="'Add a new option, current text: ' + textControl.value"
          />
          <mat-hint>{{ textControl.value?.length || 0 }}/100</mat-hint>
          @if (textControl.hasError('required')) {
            <mat-error>Option text is required</mat-error>
          }
          @if (textControl.hasError('minlength')) {
            <mat-error>Option must be at least 2 characters</mat-error>
          }
        </mat-form-field>
        
        <app-weight-control
          [value]="currentWeight()"
          (valueChange)="onWeightChange($event)"
          class="weight-control-section"
        />
        
        <button
          mat-fab
          color="primary"
          class="add-button"
          (click)="addOption()"
          [disabled]="textControl.invalid || isAdding()"
          [attr.aria-label]="'Add option: ' + textControl.value + ' with weight ' + currentWeight()"
          matTooltip="Add option"
          matTooltipPosition="above"
        >
          @if (isAdding()) {
            <mat-icon class="spinning">hourglass_empty</mat-icon>
          } @else {
            <mat-icon>add</mat-icon>
          }
        </button>
      </div>
      
      @if (showSuccess()) {
        <div class="success-message fade-in-scale" role="status" aria-live="polite">
          <mat-icon>check_circle</mat-icon>
          <span>Option added successfully!</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .option-input-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--surface-color);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-md);
      border: 2px solid rgba(0, 0, 0, 0.05);
      transition: all var(--animation-normal) ease;
      
      &:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
      }
    }

    .input-section {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .option-text-field {
      flex: 1;
      min-width: 200px;
      
      ::ng-deep .mat-mdc-form-field-wrapper {
        background: var(--background-color);
        border-radius: var(--border-radius-md);
      }
      
      ::ng-deep .mat-mdc-text-field-wrapper {
        padding: 0 !important;
      }
      
      ::ng-deep .mat-mdc-form-field-infix {
        padding-top: 16px !important;
        padding-bottom: 16px !important;
        min-height: 56px !important;
      }
      
      ::ng-deep .mat-mdc-input-element {
        padding: 0 16px !important;
      }
      
      ::ng-deep .mat-mdc-form-field-outline {
        border-radius: var(--border-radius-md);
      }
      
      ::ng-deep .mat-mdc-form-field-focus-overlay {
        border-radius: var(--border-radius-md);
      }
      
      ::ng-deep .mat-mdc-floating-label {
        left: 16px !important;
      }
    }

    .weight-control-section {
      flex-shrink: 0;
      margin-top: 4px; // Align with input field
    }

    .add-button {
      width: 56px;
      height: 56px;
      background: var(--gradient-primary);
      transition: all var(--animation-normal) ease;
      margin-top: 4px; // Align with input field
      
      &:hover:not(:disabled) {
        transform: scale(1.05) translateY(-2px);
        box-shadow: var(--shadow-xl);
      }
      
      &:disabled {
        opacity: 0.6;
        transform: none;
      }
      
      mat-icon {
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
        
        &.spinning {
          animation: spin 1s linear infinite;
        }
      }
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
      color: white;
      border-radius: var(--border-radius-lg);
      font-weight: 500;
      box-shadow: var(--shadow-md);
      
      mat-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    // Responsive design
    @media (max-width: 768px) {
      .option-input-container {
        padding: var(--spacing-md);
      }
      
      .input-section {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
      }
      
      .option-text-field {
        min-width: unset;
      }
      
      .weight-control-section {
        align-self: center;
        margin-top: 0;
      }
      
      .add-button {
        align-self: center;
        margin-top: 0;
        width: 48px;
        height: 48px;
        
        mat-icon {
          font-size: 1.25rem;
          width: 1.25rem;
          height: 1.25rem;
        }
      }
    }

    @media (max-width: 480px) {
      .input-section {
        gap: var(--spacing-sm);
      }
      
      .add-button {
        width: 44px;
        height: 44px;
        
        mat-icon {
          font-size: 1.125rem;
          width: 1.125rem;
          height: 1.125rem;
        }
      }
    }
  `]
})
export class OptionInputComponent {
  @Output() optionAdded = new EventEmitter<DecisionOption>();

  protected readonly textControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  protected readonly currentWeight = signal(3); // Default weight
  protected readonly isAdding = signal(false);
  protected readonly showSuccess = signal(false);

  protected onWeightChange(weight: number): void {
    this.currentWeight.set(weight);
  }

  protected async addOption(): Promise<void> {
    if (this.textControl.valid && !this.isAdding()) {
      this.isAdding.set(true);
      
      // Simulate a brief loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newOption: DecisionOption = {
        id: this.generateId(),
        name: this.textControl.value!.trim(),
        weight: this.currentWeight()
      };

      this.optionAdded.emit(newOption);
      
      // Reset form
      this.textControl.reset();
      this.currentWeight.set(3); // Reset to default weight
      
      // Show success message
      this.showSuccess.set(true);
      this.isAdding.set(false);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        this.showSuccess.set(false);
      }, 2000);
      
      // Focus back to input for quick entry
      setTimeout(() => {
        const input = document.querySelector('.option-text-field input') as HTMLElement;
        input?.focus();
      }, 100);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}