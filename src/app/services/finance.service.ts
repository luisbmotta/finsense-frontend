import { Injectable, signal, computed } from '@angular/core';
import {
  Transaction, Goal, Insight, Category,
  CATEGORY_LABELS, CATEGORY_COLORS,
} from '../models';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private _transactions = signal<Transaction[]>(this.buildMockTransactions());
  private _goals = signal<Goal[]>(this.buildMockGoals());

  readonly transactions = this._transactions.asReadonly();
  readonly goals = this._goals.asReadonly();

  readonly totalExpenses = computed(() =>
    this._transactions().reduce((s, t) => s + t.amount, 0)
  );

  readonly monthlyIncome = 3500;

  readonly balance = computed(() => this.monthlyIncome - this.totalExpenses());

  readonly expensesByCategory = computed(() => {
    const map: Record<string, number> = {};
    for (const t of this._transactions()) {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    }
    return map;
  });

  readonly chartSegments = computed(() => {
    const total = this.totalExpenses();
    const byCategory = this.expensesByCategory();
    let cumulative = 0;
    return (Object.keys(byCategory) as Category[]).map(cat => {
      const pct = (byCategory[cat] / total) * 100;
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

  addTransaction(tx: Omit<Transaction, 'id'>): void {
    this._transactions.update(list => [
      { ...tx, id: Date.now().toString() },
      ...list,
    ]);
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

  private buildMockTransactions(): Transaction[] {
    const d = (day: number) => new Date(2026, 5, day);
    return [
      { id: '1',  description: 'Supermercado Pão de Açúcar', amount: 287.50, category: 'alimentacao', date: d(12) },
      { id: '2',  description: 'Uber',                        amount: 32.50,  category: 'transporte',  date: d(13) },
      { id: '3',  description: 'Farmácia Droga Raia',         amount: 89.30,  category: 'saude',       date: d(11) },
      { id: '4',  description: 'iFood — Burger King',         amount: 45.90,  category: 'alimentacao', date: d(11) },
      { id: '5',  description: 'Conta de Luz (Enel)',         amount: 145.70, category: 'outros',      date: d(10) },
      { id: '6',  description: "McDonald's",                  amount: 28.70,  category: 'alimentacao', date: d(10) },
      { id: '7',  description: 'Abastecimento Shell',         amount: 180.00, category: 'transporte',  date: d(9)  },
      { id: '8',  description: 'Padaria Central',             amount: 18.40,  category: 'alimentacao', date: d(8)  },
      { id: '9',  description: 'Metrô (recarga)',             amount: 28.00,  category: 'transporte',  date: d(7)  },
      { id: '10', description: 'Internet Claro Fibra',        amount: 129.90, category: 'outros',      date: d(5)  },
      { id: '11', description: 'Netflix',                     amount: 44.90,  category: 'lazer',       date: d(5)  },
      { id: '12', description: 'Rappi — Sushi',               amount: 52.30,  category: 'alimentacao', date: d(6)  },
      { id: '13', description: 'Cinema Kinoplex',             amount: 52.00,  category: 'lazer',       date: d(3)  },
      { id: '14', description: 'Academia Smart Fit',          amount: 99.90,  category: 'saude',       date: d(1)  },
      { id: '15', description: 'Spotify Premium',             amount: 19.90,  category: 'lazer',       date: d(1)  },
    ];
  }

  private buildMockGoals(): Goal[] {
    return [
      {
        id: '1',
        name: 'Viagem para Europa',
        targetAmount: 15000,
        currentAmount: 4200,
        emoji: '✈️',
        deadline: new Date(2027, 11, 15),
        color: '#1565C0',
      },
      {
        id: '2',
        name: 'Fundo de Emergência',
        targetAmount: 10000,
        currentAmount: 7500,
        emoji: '🛡️',
        deadline: new Date(2026, 9, 1),
        color: '#00897B',
      },
      {
        id: '3',
        name: 'Notebook Novo',
        targetAmount: 5000,
        currentAmount: 1850,
        emoji: '💻',
        deadline: new Date(2026, 11, 1),
        color: '#7B1FA2',
      },
      {
        id: '4',
        name: 'Curso de Inglês',
        targetAmount: 2000,
        currentAmount: 800,
        emoji: '📚',
        deadline: new Date(2026, 7, 1),
        color: '#E65100',
      },
    ];
  }
}
