import { Component, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FinanceService } from '../../services/finance.service';
import { Category, CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS } from '../../models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe,
    MatIconModule, MatButtonModule, MatChipsModule, MatDividerModule,
  ],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <h2 class="page-title">Extrato</h2>
        <div class="total-badge">
          Total: {{ filteredTotal() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
        </div>
      </div>

      <!-- Month filter -->
      <div class="filter-section">
        <p class="filter-label">Mês</p>
        <div class="chips-row">
          @for (m of months; track m.value) {
            <button
              class="chip"
              [class.chip-active]="selectedMonth() === m.value"
              (click)="selectedMonth.set(m.value)"
            >
              {{ m.label }}
            </button>
          }
        </div>
      </div>

      <!-- Category filter -->
      <div class="filter-section">
        <p class="filter-label">Categoria</p>
        <div class="chips-row">
          <button
            class="chip"
            [class.chip-active]="selectedCategory() === 'all'"
            (click)="selectedCategory.set('all')"
          >
            Todas
          </button>
          @for (cat of categories; track cat.value) {
            <button
              class="chip"
              [class.chip-active]="selectedCategory() === cat.value"
              [style.--chip-color]="cat.color"
              (click)="selectedCategory.set(cat.value)"
            >
              {{ cat.label }}
            </button>
          }
        </div>
      </div>

      @if (finance.error(); as err) {
        <div class="error-banner">{{ err }}</div>
      }

      <!-- Transaction list -->
      <div class="tx-list">
        @if (finance.loading() && filteredTransactions().length === 0) {
          <div class="empty-state">
            <mat-icon>hourglass_top</mat-icon>
            <p>Carregando transações...</p>
          </div>
        } @else if (filteredTransactions().length === 0) {
          <div class="empty-state">
            <mat-icon>receipt_long</mat-icon>
            <p>Nenhuma transação encontrada</p>
          </div>
        } @else {
          @for (tx of filteredTransactions(); track tx.id) {
            <div class="tx-card">
              <div class="tx-icon" [style.background]="getCatColor(tx.category) + '18'">
                <mat-icon [style.color]="getCatColor(tx.category)">{{ getCatIcon(tx.category) }}</mat-icon>
              </div>
              <div class="tx-details">
                <p class="tx-desc">{{ tx.description }}</p>
                <div class="tx-meta">
                  <span class="cat-pill" [style.background]="getCatColor(tx.category) + '20'" [style.color]="getCatColor(tx.category)">
                    {{ getCatLabel(tx.category) }}
                  </span>
                  <span class="tx-date">{{ tx.date | date:'dd MMM yyyy':'':'pt-BR' }}</span>
                </div>
              </div>
              <div class="tx-amount">
                <span class="amount-value">
                  - {{ tx.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      padding: 20px 16px 24px;
      max-width: 480px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: #1A1A2E;
      margin: 0;
    }
    .total-badge {
      background: #EFF6FF;
      color: #1565C0;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid #BFDBFE;
    }

    .error-banner {
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      color: #B91C1C;
      font-size: 12px;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }

    /* Filters */
    .filter-section {
      margin-bottom: 16px;
    }
    .filter-label {
      font-size: 11px;
      font-weight: 600;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin: 0 0 8px;
    }
    .chips-row {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }
    .chips-row::-webkit-scrollbar { display: none; }

    .chip {
      flex-shrink: 0;
      padding: 6px 14px;
      border-radius: 20px;
      border: 1.5px solid #E5E7EB;
      background: #fff;
      font-size: 12px;
      font-weight: 500;
      color: #6B7280;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .chip-active {
      background: #1565C0;
      border-color: #1565C0;
      color: #fff;
    }

    /* Transaction cards */
    .tx-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }
    .tx-card {
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.07);
    }
    .tx-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tx-icon mat-icon { font-size: 22px; }
    .tx-details {
      flex: 1;
      min-width: 0;
    }
    .tx-desc {
      font-size: 14px;
      font-weight: 500;
      color: #1A1A2E;
      margin: 0 0 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tx-meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cat-pill {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .tx-date {
      font-size: 11px;
      color: #9CA3AF;
      text-transform: capitalize;
    }
    .tx-amount {
      flex-shrink: 0;
    }
    .amount-value {
      font-size: 14px;
      font-weight: 700;
      color: #EF4444;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 60px 0;
      color: #9CA3AF;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.4;
    }
    .empty-state p {
      font-size: 15px;
      margin: 0;
    }
  `],
})
export class TransactionsComponent {
  finance = inject(FinanceService);

  selectedMonth = signal<number | 'all'>('all');
  selectedCategory = signal<Category | 'all'>('all');

  months = [
    { label: 'Todos', value: 'all' as const },
    { label: 'Jun', value: 5 as number },
    { label: 'Mai', value: 4 as number },
    { label: 'Abr', value: 3 as number },
  ];

  categories = (Object.keys(CATEGORY_LABELS) as Category[]).map(cat => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
    color: CATEGORY_COLORS[cat],
  }));

  filteredTransactions = computed(() => {
    return this.finance.transactions().filter(tx => {
      const monthMatch =
        this.selectedMonth() === 'all' ||
        tx.date.getMonth() === this.selectedMonth();
      const catMatch =
        this.selectedCategory() === 'all' ||
        tx.category === this.selectedCategory();
      return monthMatch && catMatch;
    });
  });

  filteredTotal = computed(() =>
    this.filteredTransactions().reduce((s, t) => s + t.amount, 0)
  );

  getCatColor(cat: string): string {
    return (CATEGORY_COLORS as Record<string, string>)[cat] ?? '#9CA3AF';
  }
  getCatIcon(cat: string): string {
    return (CATEGORY_ICONS as Record<string, string>)[cat] ?? 'category';
  }
  getCatLabel(cat: string): string {
    return (CATEGORY_LABELS as Record<string, string>)[cat] ?? cat;
  }
}
