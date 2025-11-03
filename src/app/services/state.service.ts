import { Injectable, signal, computed, effect } from '@angular/core';
import { DecisionOption, SavedOptionList, ThemePreset, ThemeConfig } from '../models/option.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Current options signal
  private _currentOptions = signal<DecisionOption[]>([]);
  public readonly currentOptions = this._currentOptions.asReadonly();

  // Saved lists signal
  private _savedLists = signal<SavedOptionList[]>([]);
  public readonly savedLists = this._savedLists.asReadonly();

  // Current theme signal
  private _currentTheme = signal<ThemePreset>('baby-blue');
  public readonly currentTheme = this._currentTheme.asReadonly();

  // Theme configurations
  public readonly themeConfigs: ThemeConfig[] = [
    {
      name: 'baby-blue',
      displayName: 'Baby Blue',
      primary: '#87CEEB',
      secondary: '#E0F6FF',
      accent: '#4FC3F7',
      background: '#FAFFFE',
      surface: '#FFFFFF',
      text: '#2C3E50',
      textSecondary: '#7B8C98'
    },
    {
      name: 'barbie-pink',
      displayName: 'Barbie Pink',
      primary: '#FF69B4',
      secondary: '#FFE4E6',
      accent: '#FF1493',
      background: '#FFF8F9',
      surface: '#FFFFFF',
      text: '#2D1B20',
      textSecondary: '#8B5A6B'
    },
    {
      name: 'black-white',
      displayName: 'Black & White',
      primary: '#2C2C2C',
      secondary: '#F5F5F5',
      accent: '#666666',
      background: '#FFFFFF',
      surface: '#F9F9F9',
      text: '#1A1A1A',
      textSecondary: '#666666'
    }
  ];

  // Current theme config computed signal
  public readonly currentThemeConfig = computed(() => 
    this.themeConfigs.find(config => config.name === this._currentTheme()) || this.themeConfigs[0]
  );

  // Computed signal for options count
  public readonly optionsCount = computed(() => this._currentOptions().length);

  // Computed signal for total weight
  public readonly totalWeight = computed(() => 
    this._currentOptions().reduce((sum, option) => sum + option.weight, 0)
  );

  // Computed signal to check if we can spin (at least 2 options)
  public readonly canSpin = computed(() => this._currentOptions().length >= 2);

  constructor() {
    // Load persisted state on initialization
    this.loadFromStorage();

    // Persist state changes to localStorage
    effect(() => {
      this.saveToStorage();
    });
  }

  // Options management
  addOption(name: string, weight: number = 1): void {
    const newOption: DecisionOption = {
      id: this.generateId(),
      name: name.trim(),
      weight: Math.max(1, Math.min(5, weight)) // Ensure weight is between 1-5
    };
    
    this._currentOptions.update(options => [...options, newOption]);
  }

  updateOption(id: string, updates: Partial<DecisionOption>): void {
    this._currentOptions.update(options => 
      options.map(option => 
        option.id === id 
          ? { ...option, ...updates, weight: updates.weight ? Math.max(1, Math.min(5, updates.weight)) : option.weight }
          : option
      )
    );
  }

  removeOption(id: string): void {
    this._currentOptions.update(options => options.filter(option => option.id !== id));
  }

  clearOptions(): void {
    this._currentOptions.set([]);
  }

  reorderOptions(fromIndex: number, toIndex: number): void {
    this._currentOptions.update(options => {
      const newOptions = [...options];
      const item = newOptions.splice(fromIndex, 1)[0];
      newOptions.splice(toIndex, 0, item);
      return newOptions;
    });
  }

  // Saved lists management
  saveCurrentList(name: string): void {
    if (this._currentOptions().length === 0) return;

    const savedList: SavedOptionList = {
      id: this.generateId(),
      name: name.trim(),
      options: [...this._currentOptions()], // Create a copy
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this._savedLists.update(lists => [...lists, savedList]);
  }

  loadSavedList(listId: string): void {
    const list = this._savedLists().find(l => l.id === listId);
    if (list) {
      this._currentOptions.set([...list.options]); // Create a copy
    }
  }

  deleteSavedList(listId: string): void {
    this._savedLists.update(lists => lists.filter(list => list.id !== listId));
  }

  updateSavedList(listId: string, updates: Partial<SavedOptionList>): void {
    this._savedLists.update(lists =>
      lists.map(list =>
        list.id === listId
          ? { ...list, ...updates, updatedAt: new Date() }
          : list
      )
    );
  }

  // Theme management
  setTheme(theme: ThemePreset): void {
    this._currentTheme.set(theme);
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // LocalStorage persistence
  private saveToStorage(): void {
    // Check if localStorage is available (not available during SSR)
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    const state = {
      currentOptions: this._currentOptions(),
      savedLists: this._savedLists(),
      currentTheme: this._currentTheme()
    };
    
    try {
      localStorage.setItem('bright-decision-maker-state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    // Check if localStorage is available (not available during SSR)
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const stored = localStorage.getItem('bright-decision-maker-state');
      if (stored) {
        const state = JSON.parse(stored);
        
        if (state.currentOptions) {
          this._currentOptions.set(state.currentOptions);
        }
        
        if (state.savedLists) {
          // Convert date strings back to Date objects
          const listsWithDates = state.savedLists.map((list: any) => ({
            ...list,
            createdAt: new Date(list.createdAt),
            updatedAt: new Date(list.updatedAt)
          }));
          this._savedLists.set(listsWithDates);
        }
        
        if (state.currentTheme && this.themeConfigs.some(config => config.name === state.currentTheme)) {
          this._currentTheme.set(state.currentTheme);
        }
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
      // Initialize with default state if loading fails
      this.initializeDefaultState();
    }
  }

  private initializeDefaultState(): void {
    // Add some sample options for demonstration
    this.addOption('Go for a walk', 3);
    this.addOption('Read a book', 2);
    this.addOption('Watch a movie', 4);
  }
}