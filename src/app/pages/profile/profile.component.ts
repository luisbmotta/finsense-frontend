import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page">

      <!-- Top bar -->
      <div class="top-bar">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2 class="page-title">Perfil</h2>
        <div style="width:40px"></div>
      </div>

      <!-- Hero -->
      <div class="hero">
        <div class="avatar-large">
          <mat-icon>person</mat-icon>
        </div>
        <p class="hero-name">{{ auth.currentUser()?.name }}</p>
      </div>

      <!-- Form card -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nome</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput formControlName="name" readonly>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>E-mail</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput formControlName="email" readonly>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Renda mensal</mat-label>
          <span matTextPrefix>R$&nbsp;</span>
          <input matInput type="number" min="0.01" step="0.01" formControlName="monthlyIncome">
          @if (form.get('monthlyIncome')?.hasError('required') && form.get('monthlyIncome')?.touched) {
            <mat-error>Informe sua renda mensal</mat-error>
          }
          @if (form.get('monthlyIncome')?.hasError('min') && form.get('monthlyIncome')?.touched) {
            <mat-error>A renda mensal deve ser maior que zero</mat-error>
          }
        </mat-form-field>

        @if (errorMessage(); as msg) {
          <p class="error-banner">{{ msg }}</p>
        }

        <button
          mat-raised-button
          type="submit"
          class="submit-btn"
          [disabled]="loading()"
        >
          <mat-icon>check</mat-icon>
          Salvar alterações
        </button>

        <button
          mat-stroked-button
          type="button"
          class="logout-btn"
          (click)="logout()"
        >
          <mat-icon>logout</mat-icon>
          Sair
        </button>

      </form>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: #F0F4F8;
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 8px 8px;
    }
    .page-title {
      font-size: 17px;
      font-weight: 700;
      color: #1A1A2E;
      margin: 0;
    }

    .hero {
      background: linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #00695C 100%);
      padding: 24px 24px 40px;
      text-align: center;
    }
    .avatar-large {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: rgba(255,255,255,0.20);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }
    .avatar-large mat-icon {
      font-size: 36px; width: 36px; height: 36px;
      color: #fff;
    }
    .hero-name {
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      margin: 0;
    }

    .form-card {
      background: #fff;
      border-radius: 24px 24px 0 0;
      margin-top: -20px;
      padding: 24px 20px;
      min-height: 50vh;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }

    .error-banner {
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      color: #B91C1C;
      font-size: 12px;
      border-radius: 10px;
      padding: 8px 12px;
      margin: 4px 0 0;
    }

    .submit-btn {
      width: 100%;
      height: 52px;
      border-radius: 14px !important;
      background: linear-gradient(135deg, #1565C0, #00897B) !important;
      color: #fff !important;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
    }

    .logout-btn {
      width: 100%;
      height: 48px;
      border-radius: 14px !important;
      color: #DC2626 !important;
      border-color: #FCA5A5 !important;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 10px;
    }
  `],
})
export class ProfileComponent {
  auth = inject(AuthService);
  private finance = inject(FinanceService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: [{ value: this.auth.currentUser()?.name ?? '', disabled: true }],
    email: [{ value: this.auth.currentUser()?.email ?? '', disabled: true }],
    monthlyIncome: [
      this.auth.currentUser()?.monthlyIncome ?? null,
      [Validators.required, Validators.min(0.01)],
    ],
  });

  submit(): void {
    this.form.markAllAsTouched();
    const incomeControl = this.form.get('monthlyIncome');
    if (incomeControl?.invalid) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.updateMonthlyIncome(incomeControl!.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.finance.refreshAll();
        this.snackBar.open('Renda mensal atualizada! ✅', '', {
          duration: 2500,
          panelClass: 'snack-success',
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Não foi possível salvar. Tente novamente.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/dashboard']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}
