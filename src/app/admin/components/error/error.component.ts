import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-error',
  template: `
    <h2 mat-dialog-title>{{data.title || 'Erro'}}</h2>
    <mat-dialog-content>
      <p>{{data.message}}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>OK</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { color: {{data.isSuccess ? '#4CAF50' : '#F44336'}}; }
  `],
  imports: [MatDialogModule],
})
export class ErrorComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}