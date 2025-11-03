import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('BrightDecisionMaker');
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    // Theme service will automatically apply the current theme
  }
}
