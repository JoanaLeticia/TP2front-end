import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) { }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}