import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public errorMessage: string) { }
}