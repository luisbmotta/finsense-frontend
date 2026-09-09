import { Component, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, PercentPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FinanceService } from '../../services/finance.service';
import { Goal } from '../../models';
import { CreateGoalDialogComponent } from './create-goal-dialog.component';
import { DepositDialogComponent } from './deposit-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CurrencyPipe, PercentPipe, DatePipe,
    MatIconModule, MatButtonModule, MatProgressBarModule, MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="page-title">Minhas Metas</h2>
          <p class="page-subtitle">{{ finance.goals().length }} metas ativas</p>
        </div>
        <button mat-mini-fab class="add-fab" (click)="openAddGoal()">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <!-- Summary banner -->
      <div class="summary-banner">
        <div class="summary-item">
          <span class="sum-value">{{ overallProgress() | percent:'1.0-0' }}</span>
          <span class="sum-label">Progresso geral</span>
        </div>
        <div class="sum-divider"></div>
        <div class="summary-item">
          <span class="sum-value">{{ totalSaved() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
          <span class="sum-label">Total guardado</span>
        </div>
        <div class="sum-divider"></div>
        <div class="summary-item">
          <span class="sum-value">{{ totalTarget() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
          <span class="sum-label">Total alvo</span>
        </div>
      </div>

      @if (finance.error(); as err) {
        <div class="error-banner">{{ err }}</div>
      }

      <!-- Goal cards -->
      <div class="goals-list">
        @if (finance.loading() && finance.goals().length === 0) {
          <p class="goals-empty">Carregando metas...</p>
        } @else if (finance.goals().length === 0) {
          <p class="goals-empty">Você ainda não tem metas. Toque em "+" para criar a primeira.</p>
        }
        @for (goal of finance.goals(); track goal.id) {
          <div class="goal-card">

            <div class="goal-top">
              <div class="goal-emoji-wrap" [style.background]="goal.color + '18'">
                <span class="goal-emoji">{{ goal.emoji }}</span>
              </div>
              <div class="goal-info">
                <p class="goal-name">{{ goal.name }}</p>
                <p class="goal-deadline">
                  <mat-icon class="deadline-icon">event</mat-icon>
                  {{ goal.deadline | date:'MMM yyyy':'':'pt-BR' }}
                </p>
              </div>
              <div class="goal-pct" [style.color]="goal.color">
                {{ getProgress(goal) | percent:'1.0-0' }}
              </div>
              <button
                mat-icon-button
                class="goal-delete-btn"
                aria-label="Excluir meta"
                (click)="confirmDeleteGoal(goal)"
              >
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>

            <div class="goal-amounts">
              <span class="amount-current" [style.color]="goal.color">
                {{ goal.currentAmount | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
              </span>
              <span class="amount-sep">de</span>
              <span class="amount-target">
                {{ goal.targetAmount | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
              </span>
            </div>

            <div class="progress-wrap">
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  [style.width.%]="getProgressPct(goal)"
                  [style.background]="goal.color"
                ></div>
              </div>
            </div>

            <div class="goal-footer">
              <span class="remaining">
                Faltam {{ (goal.targetAmount - goal.currentAmount) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
              </span>
              <button mat-button class="add-money-btn" [style.color]="goal.color"
                      (click)="addToGoal(goal)">
                <mat-icon>add</mat-icon> Depositar
              </button>
            </div>

          </div>
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
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: #1A1A2E;
      margin: 0;
    }
    .page-subtitle {
      font-size: 13px;
      color: #9CA3AF;
      margin: 2px 0 0;
    }
    .add-fab {
      background: linear-gradient(135deg, #1565C0, #00897B) !important;
      color: #fff !important;
      box-shadow: 0 4px 14px rgba(21,101,192,0.35) !important;
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
    .goals-empty {
      text-align: center;
      color: #9CA3AF;
      font-size: 13px;
      padding: 24px 0;
    }

    /* Summary banner */
    .summary-banner {
      background: linear-gradient(135deg, #1565C0, #00897B);
      border-radius: 16px;
      padding: 18px;
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(21,101,192,0.25);
    }
    .summary-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .sum-value {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      font-family: 'Nunito', sans-serif;
    }
    .sum-label {
      font-size: 10px;
      color: rgba(255,255,255,0.65);
      text-align: center;
    }
    .sum-divider {
      width: 1px;
      height: 36px;
      background: rgba(255,255,255,0.20);
    }

    /* Goal cards */
    .goals-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .goal-card {
      background: #fff;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    .goal-top {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .goal-emoji-wrap {
      width: 48px; height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .goal-emoji {
      font-size: 24px;
    }
    .goal-info {
      flex: 1;
    }
    .goal-name {
      font-size: 15px;
      font-weight: 600;
      color: #1A1A2E;
      margin: 0 0 2px;
    }
    .goal-deadline {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: #9CA3AF;
      margin: 0;
      text-transform: capitalize;
    }
    .deadline-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
    }
    .goal-pct {
      font-size: 18px;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
    }
    .goal-delete-btn {
      flex-shrink: 0;
      color: #9CA3AF;
      width: 32px;
      height: 32px;
      line-height: 32px;
      margin-left: 2px;
    }
    .goal-delete-btn:hover { color: #DC2626; }
    .goal-delete-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .goal-amounts {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 10px;
    }
    .amount-current {
      font-size: 20px;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
    }
    .amount-sep {
      font-size: 13px;
      color: #9CA3AF;
    }
    .amount-target {
      font-size: 14px;
      font-weight: 500;
      color: #6B7280;
    }

    /* Progress bar */
    .progress-wrap {
      margin-bottom: 12px;
    }
    .progress-bar-bg {
      height: 8px;
      background: #F0F4F8;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.6s ease;
    }

    .goal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .remaining {
      font-size: 12px;
      color: #9CA3AF;
    }
    .add-money-btn {
      font-size: 13px;
      font-weight: 600;
      min-width: unset;
      padding: 0 8px;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .add-money-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `],
})
export class GoalsComponent {
  finance = inject(FinanceService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  totalSaved = computed(() =>
    this.finance.goals().reduce((s, g) => s + g.currentAmount, 0)
  );
  totalTarget = computed(() =>
    this.finance.goals().reduce((s, g) => s + g.targetAmount, 0)
  );
  overallProgress = computed(() =>
    this.totalTarget() > 0 ? this.totalSaved() / this.totalTarget() : 0
  );

  getProgress(goal: Goal): number {
    return goal.currentAmount / goal.targetAmount;
  }

  getProgressPct(goal: Goal): number {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  }

  addToGoal(goal: Goal): void {
    const ref = this.dialog.open(DepositDialogComponent, {
      data: { goalName: goal.name, color: goal.color },
      width: '320px',
    });

    ref.afterClosed().subscribe((amount: number | undefined) => {
      if (amount == null) return;

      this.finance.deposit(goal.id, amount).subscribe({
        next: () => {
          this.snackBar.open(`Depósito registrado em "${goal.name}"! 🎯`, '', {
            duration: 2500,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
        error: () => {
          this.snackBar.open('Não foi possível registrar o depósito. Tente novamente.', '', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });
    });
  }

  confirmDeleteGoal(goal: Goal): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir meta?',
        message: `Tem certeza que quer excluir a meta "${goal.name}"? Essa ação não pode ser desfeita.`,
      },
      width: '320px',
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.finance.deleteGoal(goal.id).subscribe({
        next: () => {
          this.snackBar.open('Meta excluída.', '', {
            duration: 2500,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
        error: () => {
          this.snackBar.open('Não foi possível excluir a meta. Tente novamente.', '', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });
    });
  }

  openAddGoal(): void {
    const ref = this.dialog.open(CreateGoalDialogComponent, { width: '340px' });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.finance.createGoal(result).subscribe({
        next: () => {
          this.snackBar.open('Meta criada com sucesso! 🚀', '', {
            duration: 2500,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
        error: () => {
          this.snackBar.open('Não foi possível criar a meta. Tente novamente.', '', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });
    });
  }
}
