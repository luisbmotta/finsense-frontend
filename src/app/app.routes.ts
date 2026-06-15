import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./components/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'add-expense',
        loadComponent: () =>
          import('./pages/add-expense/add-expense.component').then(m => m.AddExpenseComponent),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./pages/goals/goals.component').then(m => m.GoalsComponent),
      },
      {
        path: 'insights',
        loadComponent: () =>
          import('./pages/insights/insights.component').then(m => m.InsightsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'auth' },
];
