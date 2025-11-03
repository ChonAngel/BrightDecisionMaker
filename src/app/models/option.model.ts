export interface DecisionOption {
  id: string;
  name: string;
  weight: number; // 1-5
}

export interface SavedOptionList {
  id: string;
  name: string;
  options: DecisionOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SpinResult {
  option: DecisionOption;
  rotation: number; // Final rotation angle
  duration: number; // Animation duration in ms
}

export type ThemePreset = 'baby-blue' | 'barbie-pink' | 'black-white';

export interface ThemeConfig {
  name: ThemePreset;
  displayName: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}