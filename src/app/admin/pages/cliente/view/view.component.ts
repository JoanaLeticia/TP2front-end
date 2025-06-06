import { Component, ElementRef, Inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Cliente } from '../../../../core/models/cliente.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewClienteComponent {
  constructor(
    public viewRef: MatDialogRef<ViewClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cliente,
    private router: Router,
    private elementRef: ElementRef
  ) { }


  editar(id: number): void {
    this.router.navigate(['/cliente/edit', id]);
    this.viewRef.close(); 
  }

  cancelar(): void {
    this.viewRef.close(false);
  }
}