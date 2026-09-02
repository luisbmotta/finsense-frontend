import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NewGoal } from '../../services/finance.service';

const COLOR_OPTIONS = ['#1565C0', '#00897B', '#7B1FA2', '#E65100', '#C62828', '#2E7D32'];

@Component({
  selector: 'app-create-goal-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>Nova meta</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="content">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nome da meta</mat-label>
          <input matInput formControlName="name" placeholder="Ex: Viagem para Europa" maxlength="120">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Valor alvo</mat-label>
          <span matTextPrefix>R$&nbsp;</span>
          <input matInput type="number" min="0.01" step="0.01" formControlName="targetAmount">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Emoji</mat-label>
          <input matInput formControlName="emoji" placeholder="✈️" maxlength="4">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Prazo</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="deadline">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <p class="section-label">Cor</p>
        <div class="color-grid">
          @for (c of colorOptions; track c) {
            <button
              type="button"
              class="color-swatch"
              [class.selected]="form.value.color === c"
              [style.background]="c"
              (click)="form.patchValue({ color: c })"
            ></button>
          }
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Criar meta</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-top: 8px;
      min-width: 280px;
    }
    .full-width { width: 100%; }
    .section-label {
      font-size: 12px;
      font-weight: 600;
      color: #6B7280;
      margin: 4px 0 8px;
    }
    .color-grid {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .color-swatch {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      padding: 0;
    }
    .color-swatch.selected {
      border-color: #1A1A2E;
    }
  `],
})
export class CreateGoalDialogComponent {
  dialogRef = inject(MatDialogRef<CreateGoalDialogComponent>);
  private fb = inject(FormBuilder);

  colorOptions = COLOR_OPTIONS;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    targetAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    emoji: ['🎯', Validators.required],
    deadline: [null as Date | null, Validators.required],
    color: [COLOR_OPTIONS[0], Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const result: NewGoal = {
      name: value.name,
      targetAmount: value.targetAmount,
      emoji: value.emoji,
      deadline: value.deadline,
      color: value.color,
    };
    this.dialogRef.close(result);
  }
}
