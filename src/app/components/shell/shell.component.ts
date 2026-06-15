import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent],
  template: `
    <div class="shell-container">
      <main class="shell-content">
        <router-outlet />
      </main>
      <app-bottom-nav />
    </div>
  `,
  styles: [`
    .shell-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #F0F4F8;
    }
    .shell-content {
      flex: 1;
      padding-bottom: 80px;
    }
  `],
})
export class ShellComponent {}
