import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, tap } from 'rxjs';
import {
  Transaction, Goal, Category,
  CATEGORY_LABELS, CATEGORY_COLORS,
} from '../models';
import { API_BASE_URL } from '../core/api-config';
import { parseISODate, toISODateString } from '../core/date-utils';
import { AuthService } from './auth.service';

interface TransactionDto {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: string;
}

interface GoalDto {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  deadline: string;
  color: string;
}

interface SummaryDto {
  monthlyIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: Record<string, number>;
}

export interface NewTransaction {
  description: string;
  amount: number;
  category: Category;
  date: Date;
}

export interface NewGoal {
  name: string;
  targetAmount: number;
  emoji: string;
  deadline: Date;
  color: string;
}

export interface ParsedTransaction {
  amount: number;
  category: Category;
  description: string;
}

interface InsightsResponseDto {
  insights: string[];
}

const EMPTY_SUMMARY: SummaryDto = {
  monthlyIncome: 0,
  totalExpenses: 0,
  balance: 0,
  expensesByCategory: {},
};

function mapTransaction(dto: TransactionDto): Transaction {
  return { ...dto, date: parseISODate(dto.date) };
}

function mapGoal(dto: GoalDto): Goal {
  return { ...dto, deadline: parseISODate(dto.deadline) };
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private _transactions = signal<Transaction[]>([]);
  private _goals = signal<Goal[]>([]);
  private _summary = signal<SummaryDto>(EMPTY_SUMMARY);

  readonly transactions = this._transactions.asReadonly();
  readonly goals = this._goals.asReadonly();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private _aiInsights = signal<string[]>([]);
  readonly aiInsights = this._aiInsights.asReadonly();
  readonly insightsLoading = signal(false);
  readonly insightsError = signal<string | null>(null);

  readonly totalExpenses = computed(() => this._summary().totalExpenses);
  readonly monthlyIncome = computed(() => this._summary().monthlyIncome);
  readonly balance = computed(() => this._summary().balance);
  readonly expensesByCategory = computed(() => this._summary().expensesByCategory);

  readonly chartTotal = computed(() =>
    Object.values(this.expensesByCategory()).reduce((sum, v) => sum + v, 0)
  );

  readonly chartSegments = computed(() => {
    const total = this.chartTotal();
    const byCategory = this.expensesByCategory();
    let cumulative = 0;
    return (Object.keys(byCategory) as Category[]).map(cat => {
      const pct = total > 0 ? (byCategory[cat] / total) * 100 : 0;
      const start = cumulative;
      cumulative += pct;
      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        color: CATEGORY_COLORS[cat],
        amount: byCategory[cat],
        percentage: pct,
        startPct: start,
        endPct: cumulative,
      };
    });
  });

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.refreshAll();
      } else {
        this._transactions.set([]);
        this._goals.set([]);
        this._summary.set(EMPTY_SUMMARY);
        this.error.set(null);
      }
    }, { allowSignalWrites: true });
  }

  refreshAll(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      transactions: this.http.get<TransactionDto[]>(`${API_BASE_URL}/transactions`),
      goals: this.http.get<GoalDto[]>(`${API_BASE_URL}/goals`),
      summary: this.http.get<SummaryDto>(`${API_BASE_URL}/summary`),
    }).subscribe({
      next: ({ transactions, goals, summary }) => {
        this._transactions.set(transactions.map(mapTransaction));
        this._goals.set(goals.map(mapGoal));
        this._summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar seus dados. Tente novamente em instantes.');
        this.loading.set(false);
      },
    });
  }

  addTransaction(payload: NewTransaction): Observable<Transaction> {
    const body = { ...payload, date: toISODateString(payload.date) };
    return this.http.post<TransactionDto>(`${API_BASE_URL}/transactions`, body).pipe(
      map(mapTransaction),
      tap(tx => {
        this._transactions.update(list => [tx, ...list]);
        this.refreshSummary();
      })
    );
  }

  parseTransaction(text: string): Observable<ParsedTransaction> {
    return this.http.post<ParsedTransaction>(`${API_BASE_URL}/transactions/parse`, { text });
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/transactions/${id}`).pipe(
      tap(() => {
        this._transactions.update(list => list.filter(tx => tx.id !== id));
        this.refreshSummary();
      })
    );
  }

  createGoal(payload: NewGoal): Observable<Goal> {
    const body = { ...payload, deadline: toISODateString(payload.deadline) };
    return this.http.post<GoalDto>(`${API_BASE_URL}/goals`, body).pipe(
      map(mapGoal),
      tap(goal => this._goals.update(list => [goal, ...list]))
    );
  }

  deposit(goalId: string, amount: number): Observable<Goal> {
    return this.http.post<GoalDto>(`${API_BASE_URL}/goals/${goalId}/deposit`, { amount }).pipe(
      map(mapGoal),
      tap(updated => {
        this._goals.update(list => list.map(g => (g.id === updated.id ? updated : g)));
        // O depósito cria uma transação vinculada à meta no backend, então o
        // extrato e o saldo precisam ser recarregados junto com a meta.
        this.refreshTransactions();
        this.refreshSummary();
      })
    );
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/goals/${id}`).pipe(
      tap(() => this._goals.update(list => list.filter(g => g.id !== id)))
    );
  }

  private refreshSummary(): void {
    this.http
      .get<SummaryDto>(`${API_BASE_URL}/summary`)
      .subscribe(summary => this._summary.set(summary));
  }

  private refreshTransactions(): void {
    this.http
      .get<TransactionDto[]>(`${API_BASE_URL}/transactions`)
      .subscribe(transactions => this._transactions.set(transactions.map(mapTransaction)));
  }

  refreshInsights(): void {
    this.insightsLoading.set(true);
    this.insightsError.set(null);

    this.http.get<InsightsResponseDto>(`${API_BASE_URL}/insights`).subscribe({
      next: res => {
        this._aiInsights.set(res.insights);
        this.insightsLoading.set(false);
      },
      error: () => {
        this.insightsError.set('Não foi possível gerar seus insights agora. Tente novamente em instantes.');
        this.insightsLoading.set(false);
      },
    });
  }
}
