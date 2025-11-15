import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DecisionOption, SpinResult } from '../../models/option.model';
import { SpinService } from '../../services/spin.service';

@Component({
  selector: 'app-spin-wheel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="spin-wheel-container">
      <!-- Wheel section with fireworks -->
      <div class="wheel-section">
        <!-- Wheel SVG -->
        <div class="wheel-wrapper" [class.spinning]="isSpinning()">
          <svg 
            class="wheel-svg" 
            [style.transform]="'rotate(' + rotation() + 'deg)'"
            viewBox="0 0 400 400"
            width="400" 
            height="400">
            
            @if (segments().length > 0) {
              @for (segment of segments(); track segment.option.id) {
                <!-- Wheel segment -->
                <path 
                  [attr.d]="segment.pathData"
                  [attr.fill]="segment.color"
                  [attr.stroke]="'#ffffff'"
                  [attr.stroke-width]="2"
                  class="wheel-segment">
                </path>
                
                <!-- Text label -->
                <text 
                  [attr.x]="segment.textX"
                  [attr.y]="segment.textY"
                  [attr.transform]="'rotate(' + segment.textRotation + ' ' + segment.textX + ' ' + segment.textY + ')'"
                  class="segment-text"
                  text-anchor="middle"
                  dominant-baseline="middle">
                  {{ segment.option.name }}
                </text>
              }
            } @else {
              <!-- Empty state -->
              <circle cx="200" cy="200" r="150" fill="#f0f0f0" stroke="#ddd" stroke-width="2"></circle>
              <text x="200" y="200" text-anchor="middle" dominant-baseline="middle" class="empty-text">
                Add options to spin!
              </text>
            }
          </svg>
          
          <!-- Top pointer pointing down at wheel -->
          <div class="wheel-pointer">
            <svg width="40" height="50" viewBox="0 0 40 50">
              <polygon points="10,0 30,0 20,25" fill="#FF6B6B" stroke="#fff" stroke-width="2"/>
            </svg>
          </div>
        </div>
        
        <!-- Fireworks container at wheel level -->
        @if (lastResult()) {
          <div class="fireworks-container">
            @for (firework of fireworks; track $index) {
              <div class="firework" [style.left.%]="firework.x" [style.top.%]="firework.y">
                @for (particle of firework.particles; track $index) {
                  <div class="particle" 
                       [style.background]="particle.color"
                       [style.animation-delay.ms]="particle.delay"></div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Spin Button -->
      <div class="spin-controls">
        <button 
          mat-fab 
          extended 
          color="primary"
          [disabled]="optionsArray.length === 0 || isSpinning()"
          (click)="spin()"
          class="spin-button">
          <mat-icon>casino</mat-icon>
          {{ isSpinning() ? 'Spinning...' : 'Spin!' }}
        </button>
      </div>

      <!-- Result Display -->
      @if (lastResult()) {
        <div class="result-display fade-in-scale">
          <div class="result-card cute-card">
            <h3>🎉 Result!</h3>
            <p class="result-option">{{ lastResult()!.option.name }}</p>
            @if (lastResult()!.option.weight > 1) {
              <p class="result-weight">Weight: {{ lastResult()!.option.weight }}/5</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .spin-wheel-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
    }

    .wheel-section {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wheel-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wheel-svg {
      transition: transform 3s cubic-bezier(0.2, 0.8, 0.2, 1);
      filter: drop-shadow(var(--shadow-lg));
    }

    .wheel-wrapper.spinning .wheel-svg {
      transition: transform 3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .wheel-segment {
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .wheel-segment:hover {
      opacity: 0.8;
    }

    .segment-text {
      font-family: 'Poppins', sans-serif;
      font-size: 12px;
      font-weight: 500;
      fill: #333;
      pointer-events: none;
    }

    .empty-text {
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      fill: #999;
    }

    .wheel-pointer {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .spin-controls {
      margin-top: var(--spacing-xs);
    }

    .spin-button {
      font-family: 'Poppins', sans-serif !important;
      font-weight: 600 !important;
      border-radius: var(--border-radius-xl) !important;
      transform: scale(1);
      transition: transform var(--animation-normal) ease;
      padding: 0 var(--spacing-lg) !important;
      height: 64px !important;
      font-size: 1.2rem !important;
      
      mat-icon {
        font-size: 2rem !important;
        width: 2rem !important;
        height: 2rem !important;
        margin-right: var(--spacing-sm) !important;
      }
    }

    .spin-button:not([disabled]):hover {
      transform: scale(1.08);
    }

    .spin-button[disabled] {
      opacity: 0.6;
    }

    .result-display {
      margin-top: var(--spacing-lg);
      width: 100%;
      max-width: 300px;
      position: relative;
    }

    .fireworks-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      height: 600px;
      pointer-events: none;
      overflow: visible;
      z-index: 10;
    }

    .firework {
      position: absolute;
      width: 8px;
      height: 8px;
    }

    .particle {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: explode 1.5s ease-out forwards;
      box-shadow: 0 0 8px currentColor;
    }

    @keyframes explode {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(var(--tx), var(--ty)) scale(0);
        opacity: 0;
      }
    }

    /* Generate particle animations - bigger distances */
    .particle:nth-child(1) { --tx: 80px; --ty: -120px; }
    .particle:nth-child(2) { --tx: 120px; --ty: -80px; }
    .particle:nth-child(3) { --tx: 120px; --ty: 0px; }
    .particle:nth-child(4) { --tx: 120px; --ty: 80px; }
    .particle:nth-child(5) { --tx: 80px; --ty: 120px; }
    .particle:nth-child(6) { --tx: 0px; --ty: 120px; }
    .particle:nth-child(7) { --tx: -80px; --ty: 120px; }
    .particle:nth-child(8) { --tx: -120px; --ty: 80px; }
    .particle:nth-child(9) { --tx: -120px; --ty: 0px; }
    .particle:nth-child(10) { --tx: -120px; --ty: -80px; }
    .particle:nth-child(11) { --tx: -80px; --ty: -120px; }
    .particle:nth-child(12) { --tx: 0px; --ty: -120px; }

    .result-card {
      text-align: center;
      background: var(--gradient-secondary);
      border: 2px solid var(--primary-color);
      position: relative;
      z-index: 2;
    }

    .result-card h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--primary-color);
      font-size: 1.2em;
    }

    .result-option {
      font-size: 1.4em;
      font-weight: 600;
      color: var(--text-color);
      margin: var(--spacing-sm) 0;
    }

    .result-weight {
      font-size: 0.9em;
      color: var(--text-secondary-color);
      margin: var(--spacing-sm) 0 0 0;
    }

    @media (max-width: 768px) {
      .wheel-svg {
        width: 320px;
        height: 320px;
      }
      
      .segment-text {
        font-size: 11px;
      }
      
      .spin-wheel-container {
        padding: var(--spacing-md);
      }
    }
    
    @media (max-width: 480px) {
      .wheel-svg {
        width: 280px;
        height: 280px;
      }
      
      .segment-text {
        font-size: 10px;
      }
    }
  `]
})
export class SpinWheelComponent {
  private _optionsSignal = signal<DecisionOption[]>([]);
  
  @Input() 
  set options(value: DecisionOption[]) {
    this._optionsSignal.set(value || []);
  }
  
  get options(): DecisionOption[] {
    return this._optionsSignal();
  }
  
  @Output() spinComplete = new EventEmitter<SpinResult>();
  @Output() optionSelected = new EventEmitter<DecisionOption>();

  isSpinning = signal(false);
  rotation = signal(0);
  lastResult = signal<SpinResult | null>(null);

  // Firework effect data
  fireworks: Array<{ x: number; y: number; particles: Array<{ color: string; delay: number }> }> = [];

  get optionsArray(): DecisionOption[] {
    return this._optionsSignal();
  }

  private readonly colors = [
    '#FFB5B5', '#A8E6CF', '#B4D7FF', '#C9E4CA', '#FFF4B8',
    '#E8C4E8', '#FFD4A3', '#A8DCD1', '#FFB3A7', '#FFB3D9'
  ];

  constructor(private spinService: SpinService) {}

  segments = computed(() => {
    const opts = this._optionsSignal();
    if (opts.length === 0) return [];

    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
    let currentAngle = 0;
    
    return opts.map((option, index) => {
      const weight = option.weight / totalWeight;
      const angle = weight * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // Calculate path data for SVG arc
      const centerX = 200;
      const centerY = 200;
      const radius = 150;
      
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      // Calculate text position
      const textAngle = startAngle + angle / 2;
      const textRadius = radius * 0.7;
      const textAngleRad = (textAngle * Math.PI) / 180;
      const textX = centerX + textRadius * Math.cos(textAngleRad);
      const textY = centerY + textRadius * Math.sin(textAngleRad);
      
      currentAngle = endAngle;
      
      return {
        option,
        pathData,
        color: this.colors[index % this.colors.length],
        textX,
        textY,
        textRotation: textAngle > 90 && textAngle < 270 ? textAngle + 180 : textAngle
      };
    });
  });

  spin(): void {
    if (this.optionsArray.length === 0 || this.isSpinning()) return;

    this.isSpinning.set(true);
    this.lastResult.set(null);
    this.fireworks = []; // Clear previous fireworks

    // Generate spin result
    const result = this.spinService.spin(this.optionsArray);
    
    // Calculate rotation (multiple full rotations + final position)
    const baseRotation = this.rotation();
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const segments = this.segments();
    const segmentIndex = segments.findIndex(s => s.option.id === result.option.id);
    const segmentAngle = segmentIndex >= 0 ? 
      (segmentIndex / segments.length) * 360 : 0;
    
    // Calculate final rotation (pointing up, so subtract 90 degrees)
    const finalRotation = baseRotation + (spins * 360) + (360 - segmentAngle) - 90;
    
    this.rotation.set(finalRotation);

    // Show result after spin animation
    setTimeout(() => {
      this.isSpinning.set(false);
      this.lastResult.set(result);
      this.spinComplete.emit(result);
      
      // Trigger fireworks
      this.generateFireworks();
      
      // Wait 3 more seconds before removing the option from the wheel
      setTimeout(() => {
        this.optionSelected.emit(result.option);
      }, 3000);
    }, 3000);
  }

  private generateFireworks(): void {
    const fireworkColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#F72585', '#DDA0DD'];
    
    // Generate 5 fireworks at random positions
    this.fireworks = Array.from({ length: 5 }, (_, i) => ({
      x: 10 + Math.random() * 80, // Random x position (10% to 90%)
      y: 10 + Math.random() * 60, // Random y position (10% to 70%)
      particles: Array.from({ length: 12 }, (_, j) => ({
        color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
        delay: i * 150 + j * 20 // Stagger the fireworks and particles
      }))
    }));

    // Clear fireworks after animation completes - extended to 5 seconds
    setTimeout(() => {
      this.fireworks = [];
    }, 5000);
  }
}