import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content class="content">
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close(false)">
        {{ data.cancelLabel ?? 'Cancelar' }}
      </button>
      <button mat-raised-button type="button" class="confirm-btn" (click)="dialogRef.close(true)">
        {{ data.confirmLabel ?? 'Excluir' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .content {
      min-width: 260px;
      padding-top: 4px;
    }
    .content p {
      font-size: 14px;
      color: #4B5563;
      line-height: 1.5;
      margin: 0;
    }
    .confirm-btn {
      background: #DC2626 !important;
      color: #fff !important;
    }
  `],
})
export class ConfirmDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
