import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, tap } from 'rxjs';
import {
  Transaction, Goal, Insight, Category,
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

  readonly totalExpenses = computed(() => this._summary().totalExpenses);
  readonly monthlyIncome = computed(() => this._summary().monthlyIncome);
  readonly balance = computed(() => this._summary().balance);
  readonly expensesByCategory = computed(() => this._summary().expensesByCategory);

  readonly chartSegments = computed(() => {
    const total = this.totalExpenses();
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
      tap(updated => this._goals.update(list => list.map(g => (g.id === updated.id ? updated : g))))
    );
  }

  private refreshSummary(): void {
    this.http
      .get<SummaryDto>(`${API_BASE_URL}/summary`)
      .subscribe(summary => this._summary.set(summary));
  }

  getInsights(): Insight[] {
    return [
      {
        id: '1',
        title: 'Alimentação acima da média',
        description:
          'Você gastou R$ 432,80 em alimentação este mês — 15% acima da sua média dos últimos 3 meses. Cozinhar 3x por semana pode economizar cerca de R$ 180.',
        type: 'warning',
        icon: 'restaurant',
      },
      {
        id: '2',
        title: 'Viagem Europa: 18 meses para a meta',
        description:
          'Economizando R$ 600/mês, você atinge sua meta de R$ 15.000 em 18 meses. Que tal cortar assinaturas não usadas?',
        type: 'tip',
        icon: 'flight_takeoff',
      },
      {
        id: '3',
        title: 'Lazer reduzido em 8%',
        description:
          'Parabéns! Seus gastos com lazer caíram 8% comparado ao mês passado. Continue assim para acelerar suas metas.',
        type: 'success',
        icon: 'celebration',
      },
      {
        id: '4',
        title: 'Fundo de emergência quase completo',
        description:
          'Seu fundo de emergência está 75% completo. Apenas R$ 2.500 para atingir a meta de segurança de 3 meses de despesas.',
        type: 'info',
        icon: 'shield',
      },
      {
        id: '5',
        title: 'Gastos com Uber aumentaram 30%',
        description:
          'Você gastou R$ 32,50 em Uber este mês. Considere usar mais transporte público — pode economizar R$ 120/mês.',
        type: 'warning',
        icon: 'directions_car',
      },
      {
        id: '6',
        title: 'Plano familiar Spotify economiza R$ 15/mês',
        description:
          'Você paga R$ 19,90 no Spotify individual. Um plano família divide o custo e pode sair por R$ 5,00 para você.',
        type: 'tip',
        icon: 'music_note',
      },
    ];
  }
}
