import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-page">
      <!-- Background blobs -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>

      <div class="auth-container">
        <!-- Logo -->
        <div class="logo-area">
          <div class="logo-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <h1 class="logo-name">FinSense</h1>
          <p class="logo-tagline">Inteligência financeira para você</p>
          <div class="partner-badge">
            <span>em parceria com</span>
            <strong>Claro</strong>
          </div>
        </div>

        <!-- Card -->
        <div class="auth-card">
          <!-- Toggle -->
          <div class="toggle-bar">
            <button
              class="toggle-btn"
              [class.active]="isLogin()"
              (click)="setMode(true)"
              type="button"
            >
              Entrar
            </button>
            <button
              class="toggle-btn"
              [class.active]="!isLogin()"
              (click)="setMode(false)"
              type="button"
            >
              Cadastrar
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            @if (!isLogin()) {
              <mat-form-field appearance="fill">
                <mat-label>Nome completo</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput formControlName="name" placeholder="Seu nome" autocomplete="name">
              </mat-form-field>
            }

            <mat-form-field appearance="fill">
              <mat-label>E-mail</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="voce@email.com"
                autocomplete="email"
              >
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>E-mail inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="fill">
              <mat-label>Senha</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
              >
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <mat-error>Mínimo 6 caracteres</mat-error>
              }
            </mat-form-field>

            @if (isLogin()) {
              <div class="forgot-link">
                <a href="#">Esqueceu a senha?</a>
              </div>
            }

            <button
              mat-raised-button
              type="submit"
              class="submit-btn"
              [disabled]="loading()"
            >
              @if (loading()) {
                <mat-spinner diameter="20" color="accent"></mat-spinner>
              } @else {
                <mat-icon>{{ isLogin() ? 'login' : 'person_add' }}</mat-icon>
                {{ isLogin() ? 'Entrar na conta' : 'Criar conta grátis' }}
              }
            </button>
          </form>

          <p class="terms">
            Ao continuar você aceita os
            <a href="#">Termos de Uso</a> e a
            <a href="#">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: linear-gradient(160deg, #0D47A1 0%, #1565C0 40%, #00695C 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      position: relative;
      overflow: hidden;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      opacity: 0.12;
    }
    .blob-1 {
      width: 360px; height: 360px;
      background: #42A5F5;
      top: -80px; right: -80px;
    }
    .blob-2 {
      width: 280px; height: 280px;
      background: #4DB6AC;
      bottom: -60px; left: -60px;
    }

    .auth-container {
      width: 100%;
      max-width: 400px;
      position: relative;
      z-index: 1;
    }

    /* Logo */
    .logo-area {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px; height: 64px;
      border-radius: 20px;
      background: rgba(255,255,255,0.20);
      backdrop-filter: blur(8px);
      margin-bottom: 10px;
    }
    .logo-icon mat-icon {
      font-size: 34px; width: 34px; height: 34px;
      color: #fff;
    }
    .logo-name {
      font-family: 'Nunito', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo-tagline {
      color: rgba(255,255,255,0.75);
      font-size: 14px;
      margin: 4px 0 12px;
    }
    .partner-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 12px;
      color: rgba(255,255,255,0.85);
    }
    .partner-badge strong {
      color: #fff;
      font-weight: 700;
    }

    /* Card */
    .auth-card {
      background: #fff;
      border-radius: 24px;
      padding: 28px 24px 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.20);
    }

    /* Toggle */
    .toggle-bar {
      display: flex;
      gap: 4px;
      background: #F0F4F8;
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 24px;
    }
    .toggle-btn {
      flex: 1;
      padding: 8px;
      border: none;
      background: transparent;
      border-radius: 9px;
      font-size: 14px;
      font-weight: 600;
      color: #6B7280;
      cursor: pointer;
      transition: all 0.2s;
    }
    .toggle-btn.active {
      background: #fff;
      color: #1565C0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.10);
    }

    /* Form fields */
    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-icon-prefix mat-icon {
      color: #9CA3AF;
      margin-right: 4px;
    }

    .forgot-link {
      text-align: right;
      margin: -4px 0 4px;
    }
    .forgot-link a {
      font-size: 12px;
      color: #1565C0;
      text-decoration: none;
    }

    .submit-btn {
      margin-top: 8px;
      height: 48px;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #1565C0, #00897B) !important;
      color: #fff !important;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .terms {
      margin-top: 16px;
      font-size: 11px;
      color: #9CA3AF;
      text-align: center;
      line-height: 1.5;
    }
    .terms a {
      color: #1565C0;
      text-decoration: none;
    }
  `],
})
export class AuthComponent {
  isLogin = signal(true);
  hidePassword = signal(true);
  loading = signal(false);
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      name:     [''],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  setMode(login: boolean): void {
    this.isLogin.set(login);
    const nameCtrl = this.form.get('name');
    if (login) {
      nameCtrl?.clearValidators();
    } else {
      nameCtrl?.setValidators(Validators.required);
    }
    nameCtrl?.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/app/dashboard']);
    }, 1200);
  }
}
