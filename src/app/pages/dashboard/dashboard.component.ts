import { Component, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { FinanceService } from '../../services/finance.service';
import { AuthService } from '../../services/auth.service';
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe,
    MatIconModule, MatButtonModule, MatRippleModule,
  ],
  template: `
    <div class="dashboard">

      <!-- Header -->
      <header class="dash-header">
        <div class="header-left">
          <p class="greeting">Olá, {{ firstName() }} 👋</p>
          <p class="month-label">{{ today | date: 'MMMM yyyy' : '' : 'pt-BR' }}</p>
        </div>
        <div class="avatar" matRipple (click)="goTo('/app/insights')">
          <mat-icon>person</mat-icon>
        </div>
      </header>

      @if (finance.error(); as err) {
        <div class="error-banner">{{ err }}</div>
      }

      <!-- Balance card -->
      <div class="balance-card">
        <div class="balance-top">
          <span class="balance-label">Saldo disponível</span>
          <mat-icon class="eye-icon" (click)="toggleBalance()">
            {{ showBalance() ? 'visibility' : 'visibility_off' }}
          </mat-icon>
        </div>
        <div class="balance-amount">
          {{ showBalance() ? (finance.balance() | currency:'BRL':'symbol':'1.2-2':'pt-BR') : 'R$ ••••••' }}
        </div>
        <div class="balance-meta">
          <div class="meta-item">
            <mat-icon class="meta-icon income">arrow_downward</mat-icon>
            <div>
              <span class="meta-label">Receita</span>
              <span class="meta-value">{{ finance.monthlyIncome() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
            </div>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <mat-icon class="meta-icon expense">arrow_upward</mat-icon>
            <div>
              <span class="meta-label">Gastos</span>
              <span class="meta-value">{{ finance.totalExpenses() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Donut Chart card -->
      <div class="chart-card fs-card">
        <div class="card-title-row">
          <span class="card-title">Gastos por categoria</span>
          <button mat-button class="see-all-btn" (click)="goTo('/app/transactions')">
            Ver tudo <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <div class="chart-area">
          <div class="donut-wrapper">
            <svg width="140" height="140" viewBox="0 0 100 100">
              @for (seg of finance.chartSegments(); track seg.category) {
                <path [attr.d]="getArcPath(seg.startPct, seg.endPct)" [attr.fill]="seg.color" />
              }
              <circle cx="50" cy="50" r="30" fill="white" />
              <text x="50" y="47" text-anchor="middle" font-size="7" fill="#9CA3AF">Total</text>
              <text x="50" y="59" text-anchor="middle" font-size="9" font-weight="600" fill="#1A1A2E">
                {{ totalLabel() }}
              </text>
            </svg>
          </div>

          <div class="legend">
            @for (seg of finance.chartSegments(); track seg.category) {
              <div class="legend-item">
                <span class="legend-dot" [style.background]="seg.color"></span>
                <span class="legend-name">{{ seg.label }}</span>
                <span class="legend-pct">{{ seg.percentage.toFixed(0) }}%</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="quick-actions fs-card">
        <p class="card-title">Ações rápidas</p>
        <div class="actions-grid">
          @for (action of quickActions; track action.label) {
            <button class="action-btn" matRipple (click)="goTo(action.route)">
              <div class="action-icon" [style.background]="action.bg">
                <mat-icon>{{ action.icon }}</mat-icon>
              </div>
              <span class="action-label">{{ action.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Recent transactions -->
      <div class="recent-card fs-card">
        <div class="card-title-row">
          <span class="card-title">Transações recentes</span>
          <button mat-button class="see-all-btn" (click)="goTo('/app/transactions')">
            Ver tudo <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <div class="tx-list">
          @if (finance.loading() && recentTransactions().length === 0) {
            <p class="tx-empty">Carregando transações...</p>
          } @else if (recentTransactions().length === 0) {
            <p class="tx-empty">Nenhuma transação ainda.</p>
          }
          @for (tx of recentTransactions(); track tx.id) {
            <div class="tx-item">
              <div class="tx-icon" [style.background]="getCatColor(tx.category) + '20'">
                <mat-icon [style.color]="getCatColor(tx.category)">{{ getCatIcon(tx.category) }}</mat-icon>
              </div>
              <div class="tx-info">
                <span class="tx-desc">{{ tx.description }}</span>
                <span class="tx-date">{{ tx.date | date: 'dd MMM' : '' : 'pt-BR' }}</span>
              </div>
              <span class="tx-amount">
                - {{ tx.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
              </span>
            </div>
          }
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard {
      padding: 0 16px 24px;
      max-width: 480px;
      margin: 0 auto;
    }

    /* Header */
    .dash-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0 16px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #1A1A2E;
      margin: 0;
    }
    .month-label {
      font-size: 13px;
      color: #6B7280;
      margin: 2px 0 0;
      text-transform: capitalize;
    }
    .avatar {
      width: 42px; height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1565C0, #00897B);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .avatar mat-icon { color: #fff; }

    .error-banner {
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      color: #B91C1C;
      font-size: 12px;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 12px;
    }
    .tx-empty {
      text-align: center;
      color: #9CA3AF;
      font-size: 13px;
      padding: 16px 0;
      margin: 0;
    }

    /* Balance card */
    .balance-card {
      background: linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #00695C 100%);
      border-radius: 20px;
      padding: 22px;
      color: #fff;
      margin-bottom: 16px;
      box-shadow: 0 8px 24px rgba(13,71,161,0.35);
    }
    .balance-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .balance-label {
      font-size: 13px;
      opacity: 0.75;
    }
    .eye-icon {
      font-size: 20px;
      cursor: pointer;
      opacity: 0.75;
    }
    .balance-amount {
      font-size: 32px;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      letter-spacing: -1px;
      margin-bottom: 20px;
    }
    .balance-meta {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 12px 16px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }
    .meta-icon {
      font-size: 18px;
      width: 32px; height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    .meta-icon.income { background: rgba(76,175,80,0.25); color: #A5D6A7; }
    .meta-icon.expense { background: rgba(244,67,54,0.25); color: #EF9A9A; }
    .meta-label {
      display: block;
      font-size: 11px;
      opacity: 0.70;
    }
    .meta-value {
      display: block;
      font-size: 14px;
      font-weight: 600;
    }
    .meta-divider {
      width: 1px;
      height: 36px;
      background: rgba(255,255,255,0.20);
      margin: 0 16px;
    }

    /* Chart card */
    .fs-card {
      background: #fff;
      border-radius: 16px;
      padding: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-bottom: 16px;
    }
    .card-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #1A1A2E;
    }
    .see-all-btn {
      font-size: 12px;
      color: #1565C0;
      min-width: unset;
      padding: 0;
      display: flex;
      align-items: center;
    }
    .see-all-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .chart-area {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .donut-wrapper {
      flex-shrink: 0;
    }
    .legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-name {
      flex: 1;
      font-size: 12px;
      color: #4B5563;
    }
    .legend-pct {
      font-size: 12px;
      font-weight: 600;
      color: #1A1A2E;
    }

    /* Quick actions */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 12px;
    }
    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 12px;
      padding: 8px 4px;
    }
    .action-icon {
      width: 48px; height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .action-icon mat-icon { color: #fff; font-size: 22px; width: 22px; height: 22px; line-height: 22px; }
    .action-label {
      font-size: 11px;
      font-weight: 500;
      color: #4B5563;
      text-align: center;
    }

    /* Recent transactions */
    .tx-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .tx-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tx-icon {
      width: 40px; height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .tx-icon mat-icon { font-size: 20px; width: 20px; height: 20px; line-height: 20px; }
    .tx-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .tx-desc {
      font-size: 13px;
      font-weight: 500;
      color: #1A1A2E;
    }
    .tx-date {
      font-size: 11px;
      color: #9CA3AF;
      text-transform: capitalize;
    }
    .tx-amount {
      font-size: 13px;
      font-weight: 600;
      color: #EF4444;
    }
  `],
})
export class DashboardComponent {
  finance = inject(FinanceService);
  private auth = inject(AuthService);
  private router = inject(Router);

  today = new Date();
  showBalance = signal(true);

  firstName = computed(() => {
    const name = this.auth.currentUser()?.name;
    return name ? name.split(' ')[0] : 'Visitante';
  });

  toggleBalance(): void {
    this.showBalance.update(v => !v);
  }

  recentTransactions = computed(() => this.finance.transactions().slice(0, 5));

  quickActions = [
    { label: 'Adicionar',  icon: 'add_circle',    bg: '#1565C0', route: '/app/add-expense'  },
    { label: 'Extrato',    icon: 'receipt_long',  bg: '#00897B', route: '/app/transactions'  },
    { label: 'Metas',      icon: 'flag',          bg: '#7B1FA2', route: '/app/goals'         },
    { label: 'Insights',   icon: 'auto_awesome',  bg: '#E65100', route: '/app/insights'      },
  ];

  totalLabel = computed(() => {
    const t = this.finance.totalExpenses();
    return 'R$ ' + Math.round(t).toLocaleString('pt-BR');
  });

  getArcPath(startPct: number, endPct: number): string {
    if (endPct - startPct >= 99.9) {
      return 'M 50 4 A 46 46 0 0 1 50 96 A 46 46 0 0 1 50 4 Z';
    }
    const cx = 50, cy = 50, r = 46;
    const toRad = (p: number) => (p / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(toRad(startPct));
    const y1 = cy + r * Math.sin(toRad(startPct));
    const x2 = cx + r * Math.cos(toRad(endPct));
    const y2 = cy + r * Math.sin(toRad(endPct));
    const sweep = endPct - startPct > 50 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${sweep} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
  }

  getCatColor(cat: string): string {
    return (CATEGORY_COLORS as Record<string, string>)[cat] ?? '#9CA3AF';
  }

  getCatIcon(cat: string): string {
    return (CATEGORY_ICONS as Record<string, string>)[cat] ?? 'category';
  }

  getCatLabel(cat: string): string {
    return (CATEGORY_LABELS as Record<string, string>)[cat] ?? cat;
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }
}
