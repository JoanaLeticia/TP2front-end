import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';


import { AdminService } from '../../../../core/services/user/admin.service';
import { Admin } from '../../../../core/models/admin.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ErrorComponent } from '../../../components/error/error.component';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ErrorComponent, CommonModule, MatSelectModule,
    MatOptionModule, RouterModule, NgIf, HeaderComponent,
    NavsideComponent, ReactiveFormsModule, FormsModule,
    NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, ConfirmationDialogComponent],
  templateUrl: './admin-form.component.html',
  styleUrl: './admin-form.component.css'
})
export class AdminFormComponent {
  administradores: Admin[] = [];
  formGroup!: FormGroup;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogError: MatDialog
  ) {
    const administrador: Admin = this.activatedRoute.snapshot.data['administrador'];
    this.formGroup = this.formBuilder.group({
      id: [administrador?.id || null],
      nome: [administrador?.nome || '', Validators.required],
      cpf: [administrador?.cpf || '', Validators.required],
      senha: [administrador?.senha || '', Validators.required],
      email: [administrador?.email || '', [Validators.required, Validators.email]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  salvar() {
    console.log('Entrou no salvar');
    console.log('Formulário:', this.formGroup.value);
    console.log('Formulário válido:', this.formGroup.valid);

    if (this.formGroup.valid) {
      const administrador = this.formGroup.value;
      if (administrador.id == null) {
        this.adminService.create(administrador).subscribe({
          next: (adminService) => {
            this.router.navigateByUrl('/adm/list');
          },
          error: (err) => {
            console.log('Erro ao Incluir' + JSON.stringify(err));
            if (err instanceof HttpErrorResponse && err.error && err.error.errors && err.error.errors.length > 0) {
              const errorMessage = err.error.errors[0].message;
              this.mostrarErro(errorMessage);
            } else {
              this.mostrarErro('Erro ao criar administrador: ' + err.message);
            }
          }
        });
      } else {
        this.adminService.update(administrador).subscribe({
          next: (adminService) => {
            this.router.navigateByUrl('/adm/list');
          },
          error: (err) => {
            console.log('Erro ao Editar' + JSON.stringify(err));
          }
        });
      }
    } else {
      console.log('Formulário inválido');
      this.mostrarErro('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  excluir() {
    if (this.formGroup.valid) {
      const administrador = this.formGroup.value;
      if (administrador.id != null) {
        this.adminService.delete(administrador).subscribe({
          next: () => {
            this.router.navigateByUrl('/adm/list');
          },
          error: (err) => {
            console.log('Erro ao Excluir' + JSON.stringify(err));
          }
        });
      }
    }
  }

  confirmDelete(administrador: Admin): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true && administrador && administrador.id !== undefined) {
        this.adminService.delete(administrador).subscribe(
          () => {
            this.administradores = this.administradores.filter(adm => adm.id !== administrador.id);

            this.router.navigateByUrl('/adm/list');
          },
          error => {
            console.log('Erro ao excluir administrador:', error);
          }
        );
      }
    });
  }

  mostrarErro(mensagemErro: string): void {
    this.dialog.open(ErrorComponent, {
      data: mensagemErro
    });
  }
}