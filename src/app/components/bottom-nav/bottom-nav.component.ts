import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

interface NavItem {
  route: string;
  icon: string;
  label: string;
  isFab?: boolean;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatRippleModule],
  template: `
    <nav class="bottom-nav">
      @for (item of navItems; track item.route) {
        @if (item.isFab) {
          <a [routerLink]="item.route" class="nav-fab" matRipple>
            <mat-icon>{{ item.icon }}</mat-icon>
          </a>
        } @else {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item"
            matRipple
          >
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }
      }
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: space-around;
      border-top: 1px solid #E5E7EB;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
      z-index: 1000;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      flex: 1;
      height: 100%;
      text-decoration: none;
      color: #9CA3AF;
      transition: color 0.2s;
      border-radius: 12px;
      padding: 4px 0;
    }

    .nav-item.active {
      color: #1565C0;
    }

    .nav-item.active .nav-icon {
      font-variation-settings: 'FILL' 1;
    }

    .nav-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      transition: transform 0.2s;
    }

    .nav-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    .nav-fab {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1565C0, #00897B);
      color: #fff;
      text-decoration: none;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(21, 101, 192, 0.40);
      transition: transform 0.15s, box-shadow 0.15s;
      flex-shrink: 0;
    }

    .nav-fab:active {
      transform: scale(0.94);
      box-shadow: 0 2px 8px rgba(21, 101, 192, 0.30);
    }

    .nav-fab mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }
  `],
})
export class BottomNavComponent {
  navItems: NavItem[] = [
    { route: '/app/dashboard',    icon: 'home',         label: 'Início'  },
    { route: '/app/transactions', icon: 'receipt_long', label: 'Extrato' },
    { route: '/app/add-expense',  icon: 'add',          label: 'Adicionar', isFab: true },
    { route: '/app/goals',        icon: 'flag',         label: 'Metas'   },
    { route: '/app/insights',     icon: 'auto_awesome', label: 'IA'      },
  ];
}
