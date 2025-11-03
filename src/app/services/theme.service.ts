import { Injectable, Renderer2, RendererFactory2, inject, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private document = inject(DOCUMENT);
  private stateService = inject(StateService);

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    // Apply theme changes automatically when theme signal changes
    effect(() => {
      this.applyTheme(this.stateService.currentTheme());
    });
  }

  private applyTheme(themeName: string): void {
    const body = this.document.body;
    
    // Remove all existing theme classes
    this.renderer.removeClass(body, 'baby-blue-theme');
    this.renderer.removeClass(body, 'barbie-pink-theme');
    this.renderer.removeClass(body, 'black-white-theme');
    
    // Add the new theme class
    this.renderer.addClass(body, `${themeName}-theme`);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(themeName);
  }

  private updateMetaThemeColor(themeName: string): void {
    const themeConfig = this.stateService.currentThemeConfig();
    let metaThemeColor = this.document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = this.renderer.createElement('meta');
      this.renderer.setAttribute(metaThemeColor, 'name', 'theme-color');
      this.renderer.appendChild(this.document.head, metaThemeColor);
    }
    
    this.renderer.setAttribute(metaThemeColor, 'content', themeConfig.primary);
  }

  /**
   * Cycles through available themes
   */
  cycleTheme(): void {
    const currentTheme = this.stateService.currentTheme();
    const themes = this.stateService.themeConfigs;
    const currentIndex = themes.findIndex(theme => theme.name === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    
    this.stateService.setTheme(themes[nextIndex].name);
  }

  /**
   * Gets CSS custom property value for current theme
   */
  getCSSCustomProperty(propertyName: string): string {
    return getComputedStyle(this.document.documentElement)
      .getPropertyValue(propertyName).trim();
  }

  /**
   * Sets CSS custom property value
   */
  setCSSCustomProperty(propertyName: string, value: string): void {
    this.document.documentElement.style.setProperty(propertyName, value);
  }
}