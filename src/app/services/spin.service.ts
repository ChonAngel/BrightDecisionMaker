import { Injectable } from '@angular/core';
import { DecisionOption, SpinResult } from '../models/option.model';

@Injectable({
  providedIn: 'root'
})
export class SpinService {

  /**
   * Selects a random option based on weights using a fair algorithm
   * @param options Array of decision options
   * @returns Spin result with selected option and animation details
   */
  spin(options: DecisionOption[]): SpinResult {
    if (options.length === 0) {
      throw new Error('Cannot spin with no options');
    }

    if (options.length === 1) {
      return {
        option: options[0],
        rotation: 360, // One full rotation
        duration: 2000 // 2 seconds
      };
    }

    // Calculate weighted selection
    const selectedOption = this.selectWeightedOption(options);
    
    // Calculate animation details
    const optionIndex = options.findIndex(opt => opt.id === selectedOption.id);
    const segmentAngle = 360 / options.length;
    
    // Calculate target rotation (multiple full rotations + target segment)
    const baseRotations = 3; // At least 3 full rotations
    const extraRotations = Math.random() * 2; // Up to 2 additional rotations
    const targetSegmentAngle = (optionIndex * segmentAngle) + (segmentAngle / 2); // Center of segment
    const totalRotation = (baseRotations + extraRotations) * 360 + targetSegmentAngle;
    
    // Calculate duration based on rotation (more rotation = longer duration)
    const baseDuration = 3000; // 3 seconds base
    const extraDuration = (extraRotations / 2) * 1000; // Up to 1 second extra
    const duration = baseDuration + extraDuration;

    return {
      option: selectedOption,
      rotation: totalRotation,
      duration
    };
  }

  /**
   * Selects an option based on weights using a fair weighted random algorithm
   * @param options Array of decision options
   * @returns Selected option
   */
  private selectWeightedOption(options: DecisionOption[]): DecisionOption {
    // Calculate total weight
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
    
    // Generate random number between 0 and totalWeight
    let random = Math.random() * totalWeight;
    
    // Find the selected option
    for (const option of options) {
      random -= option.weight;
      if (random <= 0) {
        return option;
      }
    }
    
    // Fallback to last option (shouldn't happen with proper weights)
    return options[options.length - 1];
  }

  /**
   * Calculates the segment angle for each option in the wheel
   * @param optionsCount Number of options
   * @returns Angle per segment in degrees
   */
  getSegmentAngle(optionsCount: number): number {
    return optionsCount > 0 ? 360 / optionsCount : 0;
  }

  /**
   * Generates colors for wheel segments based on the number of options
   * @param optionsCount Number of options
   * @param themeColors Base colors from current theme
   * @returns Array of colors for each segment
   */
  generateWheelColors(optionsCount: number, themeColors: { primary: string; secondary: string; accent: string }): string[] {
    const colors = [];
    const baseColors = [themeColors.primary, themeColors.secondary, themeColors.accent];
    
    for (let i = 0; i < optionsCount; i++) {
      // Cycle through base colors and create variations
      const baseColorIndex = i % baseColors.length;
      const baseColor = baseColors[baseColorIndex];
      
      // Create slight variations for more colors
      const variation = Math.floor(i / baseColors.length) * 15; // Adjust brightness
      colors.push(this.adjustColorBrightness(baseColor, variation));
    }
    
    return colors;
  }

  /**
   * Adjusts the brightness of a hex color
   * @param color Hex color string
   * @param adjustment Brightness adjustment (-100 to 100)
   * @returns Adjusted hex color
   */
  private adjustColorBrightness(color: string, adjustment: number): string {
    // Remove # if present
    const hex = color.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Apply adjustment
    const newR = Math.max(0, Math.min(255, r + adjustment));
    const newG = Math.max(0, Math.min(255, g + adjustment));
    const newB = Math.max(0, Math.min(255, b + adjustment));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Validates if the spin is fair by testing the weight distribution
   * This is mainly for testing purposes
   * @param options Array of decision options
   * @param iterations Number of test iterations
   * @returns Statistics about the selection distribution
   */
  testFairness(options: DecisionOption[], iterations: number = 10000): { [optionId: string]: number } {
    const results: { [optionId: string]: number } = {};
    
    // Initialize counters
    options.forEach(option => {
      results[option.id] = 0;
    });
    
    // Run iterations
    for (let i = 0; i < iterations; i++) {
      const selected = this.selectWeightedOption(options);
      results[selected.id]++;
    }
    
    // Convert to percentages
    Object.keys(results).forEach(id => {
      results[id] = (results[id] / iterations) * 100;
    });
    
    return results;
  }
}