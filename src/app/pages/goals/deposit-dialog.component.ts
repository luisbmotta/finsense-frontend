import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface DepositDialogData {
  goalName: string;
  color: string;
}

@Component({
  selector: 'app-deposit-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Depositar em "{{ data.goalName }}"</h2>
    <div>
      <mat-dialog-content class="content">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Valor do depósito</mat-label>
          <span matTextPrefix>R$&nbsp;</span>
          <input
            matInput
            type="number"
            min="0.01"
            step="0.01"
            [formControl]="amountControl"
            autofocus
            (keydown.enter)="submit()"
          >
          @if (amountControl.invalid && amountControl.touched) {
            <mat-error>Informe um valor maior que zero</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
        <button
          mat-raised-button
          type="button"
          [style.background]="data.color"
          style="color:#fff"
          [disabled]="amountControl.invalid"
          (click)="submit()"
        >
          Depositar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .content { min-width: 260px; padding-top: 8px; }
    .full-width { width: 100%; }
  `],
})
export class DepositDialogComponent {
  dialogRef = inject(MatDialogRef<DepositDialogComponent>);
  data = inject<DepositDialogData>(MAT_DIALOG_DATA);

  amountControl = new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]);

  submit(): void {
    if (this.amountControl.invalid) {
      this.amountControl.markAsTouched();
      return;
    }
    this.dialogRef.close(this.amountControl.value);
  }
}
