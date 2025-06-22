import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Estado } from '../../../../core/models/estado.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EstadoService } from '../../../../core/services/utils/estado.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { ErrorComponent } from '../../../components/error/error.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { Telefone } from '../../../../core/models/telefone.model';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ErrorComponent, CommonModule, MatSelectModule,
    MatOptionModule, RouterModule, NgIf, HeaderComponent,
    NavsideComponent, ReactiveFormsModule, FormsModule,
    NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, ConfirmationDialogComponent],
  templateUrl: './estado-form.component.html',
  styleUrl: './estado-form.component.css'
})
export class EstadoFormComponent {
  estados: Estado[] = [];
  telefones: Telefone[] = [];

  formEstado!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private estadoService: EstadoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const estado: Estado = this.activatedRoute.snapshot.data['estado'];

    this.formEstado = this.formBuilder.group({
      id: [(estado && estado.id)],
      nome: [(estado && estado.nome) ? estado.nome : '',
      Validators.compose([Validators.required, Validators.maxLength(60)])
      ],
      sigla: [(estado && estado.sigla) ? estado.sigla : '', Validators.required]
    });

    if (estado) {
      this.preencherFormulario(estado);
    }
  }

  preencherFormulario(estado: Estado): void {
    // Preenche campos básicos
    this.formEstado.patchValue({
      id: estado.id,
      nome: estado.nome,
      sigla: estado.sigla
    });

    console.log('Dados do estado recebidos:', estado);
  }

  createTelefoneFormGroup(): FormGroup {
    return this.formBuilder.group({
      codigoArea: ['', Validators.required],
      numero: ['', Validators.required],
    });
  }

  createEnderecoFormGroup(): FormGroup {
    return this.formBuilder.group({
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: ['', Validators.required],
      bairro: ['', Validators.required],
      cep: ['', Validators.required],
    });
  }

  salvar() {
    console.log('Entrou no salvar');
    console.log('Formulário:', this.formEstado.value);
    console.log('Formulário válido:', this.formEstado.valid);

    if (this.formEstado.valid) {
      const estado = this.formEstado.value;
      if (estado.id == null) {
        this.estadoService.insert(estado).subscribe({
          next: (estadoService) => {
            console.log('Formulário inserido ', this.formEstado.value);
            this.router.navigateByUrl('/estado/list');
          },
          error: (err) => {
            console.log('Erro ao Incluir' + JSON.stringify(err));
            if (err instanceof HttpErrorResponse && err.error && err.error.errors && err.error.errors.length > 0) {
              const errorMessage = err.error.errors[0].message;
              this.mostrarErro(errorMessage);
            } else {
              this.mostrarErro('Erro ao criar estado: ' + err.message);
            }
          }
        });
      } else {
        this.estadoService.update(estado).subscribe({
          next: (estadoService) => {
            this.router.navigateByUrl('/estado/list');
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
    if (this.formEstado.valid) {
      const estado = this.formEstado.value;
      if (estado.id != null) {
        this.estadoService.delete(estado).subscribe({
          next: () => {
            this.router.navigateByUrl('/estado/list');
          },
          error: (err) => {
            console.log('Erro ao Excluir' + JSON.stringify(err));
          }
        });
      }
    }
  }

  confirmDelete(estado: Estado): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true && estado && estado.id !== undefined) {
        this.estadoService.delete(estado).subscribe(
          () => {
            this.estados = this.estados.filter(adm => adm.id !== estado.id);

            this.router.navigateByUrl('/estado/list');
          },
          error => {
            console.log('Erro ao excluir estado:', error);
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