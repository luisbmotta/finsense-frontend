import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FinanceService } from '../../services/finance.service';
import { Category, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from '../../models';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page">

      <!-- Top bar -->
      <div class="top-bar">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2 class="page-title">Novo Gasto</h2>
        <div style="width:40px"></div>
      </div>

      <!-- Amount hero -->
      <div class="amount-hero">
        <p class="amount-label">Quanto você gastou?</p>
        <div class="amount-display">
          <span class="currency">R$</span>
          <input
            class="amount-input"
            type="number"
            min="0"
            step="0.01"
            [formControl]="amountControl"
            placeholder="0,00"
          >
        </div>
        @if (amountControl.invalid && amountControl.touched) {
          <p class="amount-error">Insira um valor válido</p>
        }
      </div>

      <!-- Form card -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">

        <!-- Category selector -->
        <p class="section-label">Categoria</p>
        <div class="category-grid">
          @for (cat of categories; track cat.value) {
            <button
              type="button"
              class="cat-btn"
              [class.selected]="selectedCategory() === cat.value"
              (click)="selectCategory(cat.value)"
            >
              <div class="cat-icon" [style.background]="cat.color + (selectedCategory() === cat.value ? '' : '20')">
                <mat-icon [style.color]="selectedCategory() === cat.value ? '#fff' : cat.color">
                  {{ cat.icon }}
                </mat-icon>
              </div>
              <span class="cat-label">{{ cat.label }}</span>
            </button>
          }
        </div>

        <!-- Date -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Data</mat-label>
          <mat-icon matPrefix>calendar_today</mat-icon>
          <input matInput [matDatepicker]="picker" formControlName="date">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          @if (form.get('date')?.hasError('required') && form.get('date')?.touched) {
            <mat-error>Selecione uma data</mat-error>
          }
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Descrição</mat-label>
          <mat-icon matPrefix>edit_note</mat-icon>
          <input
            matInput
            formControlName="description"
            placeholder="Ex: Supermercado, iFood, Uber..."
            maxlength="60"
          >
          <mat-hint align="end">{{ form.get('description')?.value?.length ?? 0 }}/60</mat-hint>
        </mat-form-field>

        <button
          mat-raised-button
          type="submit"
          class="submit-btn"
          [disabled]="loading()"
        >
          <mat-icon>check</mat-icon>
          Registrar gasto
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

    /* Amount hero */
    .amount-hero {
      background: linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #00695C 100%);
      padding: 32px 24px 40px;
      text-align: center;
    }
    .amount-label {
      color: rgba(255,255,255,0.75);
      font-size: 14px;
      margin: 0 0 12px;
    }
    .amount-display {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 8px;
    }
    .currency {
      font-size: 24px;
      font-weight: 600;
      color: rgba(255,255,255,0.70);
    }
    .amount-input {
      font-size: 48px;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      color: #fff;
      background: transparent;
      border: none;
      outline: none;
      width: 200px;
      text-align: center;
    }
    .amount-input::placeholder { color: rgba(255,255,255,0.40); }
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
    .amount-error {
      color: #FFCDD2;
      font-size: 12px;
      margin: 6px 0 0;
    }

    /* Form card */
    .form-card {
      background: #fff;
      border-radius: 24px 24px 0 0;
      margin-top: -20px;
      padding: 24px 20px;
      min-height: 60vh;
      position: relative;
    }

    .section-label {
      font-size: 13px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin: 0 0 12px;
    }

    /* Category grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }
    .cat-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      border: 2px solid transparent;
      background: transparent;
      border-radius: 12px;
      padding: 8px 2px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .cat-btn.selected {
      border-color: #1565C0;
      background: #E3F2FD;
    }
    .cat-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .cat-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .cat-label {
      font-size: 10px;
      font-weight: 500;
      color: #4B5563;
      text-align: center;
    }

    .full-width {
      width: 100%;
      margin-bottom: 4px;
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
      margin-top: 12px;
    }
  `],
})
export class AddExpenseComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private finance = inject(FinanceService);

  loading = signal(false);
  selectedCategory = signal<Category>('alimentacao');

  amountControl = this.fb.control<number | null>(null, [
    Validators.required,
    Validators.min(0.01),
  ]);

  form: FormGroup = this.fb.group({
    date:        [new Date(), Validators.required],
    description: ['', Validators.required],
  });

  categories = (Object.keys(CATEGORY_LABELS) as Category[]).map(cat => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
    icon:  CATEGORY_ICONS[cat],
    color: CATEGORY_COLORS[cat],
  }));

  selectCategory(cat: Category): void {
    this.selectedCategory.set(cat);
  }

  submit(): void {
    this.amountControl.markAsTouched();
    this.form.markAllAsTouched();

    if (!this.amountControl.valid || this.form.invalid) return;

    this.loading.set(true);
    const { date, description } = this.form.value;

    setTimeout(() => {
      this.finance.addTransaction({
        description,
        amount: this.amountControl.value!,
        category: this.selectedCategory(),
        date: new Date(date),
      });

      this.loading.set(false);
      this.snackBar.open('Gasto registrado com sucesso! ✅', '', {
        duration: 2500,
        panelClass: 'snack-success',
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      this.router.navigate(['/app/transactions']);
    }, 600);
  }

  goBack(): void {
    this.router.navigate(['/app/dashboard']);
  }
}
