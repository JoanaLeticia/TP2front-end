import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../../../core/models/cliente.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClienteService } from '../../../../core/services/user/cliente.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
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
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ErrorComponent, CommonModule, MatSelectModule,
    MatOptionModule, RouterModule, NgIf, HeaderComponent,
    NavsideComponent, ReactiveFormsModule, FormsModule,
    NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, ConfirmationDialogComponent, DatePipe, MatCardModule, MatInputModule, MatSelectModule, MatAutocompleteModule],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
  clienteForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();

    const cliente: Cliente = this.route.snapshot.data['cliente'];
    if (cliente) {
      this.preencherFormulario(cliente);
    }
  }

  inicializarFormulario(): void {
    this.clienteForm = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)]],
      dataNascimento: ['', Validators.required],
      listaTelefone: this.fb.array([this.criarGrupoTelefone()])
    });
  }

  criarGrupoTelefone(): FormGroup {
    return this.fb.group({
      id: [null],
      codigoArea: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      numero: ['', [Validators.required, Validators.pattern(/^\d{8,9}$/)]]
    });
  }

  // Métodos para manipular FormArray de telefones
  get listaTelefone(): FormArray {
    return this.clienteForm.get('listaTelefone') as FormArray;
  }

  adicionarTelefone(): void {
    this.listaTelefone.push(this.criarGrupoTelefone());
  }

  removerTelefone(index: number): void {
    if (this.listaTelefone.length > 1) {
      this.listaTelefone.removeAt(index);
    }
  }

  preencherFormulario(cliente: Cliente): void {
    this.clienteForm.patchValue({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.login,
      senha: cliente.senha,
      cpf: cliente.cpf,
      dataNascimento: cliente.dataNascimento
    });

    // Preencher telefones
    this.listaTelefone.clear();
    if (cliente.listaTelefone?.length) {
      cliente.listaTelefone.forEach(tel => {
        this.listaTelefone.push(this.fb.group({
          id: tel.id,
          codigoArea: tel.codArea,
          numero: tel.numero
        }));
      });
    } else {
      this.adicionarTelefone();
    }
  }

  formatarCPF(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.substring(0, 3) + '.' + value.substring(3);
    if (value.length > 7) value = value.substring(0, 7) + '.' + value.substring(7);
    if (value.length > 11) value = value.substring(0, 11) + '-' + value.substring(11, 13);
    this.clienteForm.get('cpf')?.setValue(value);
    event.target.value = value;
  }

  salvar(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.snackBar.open('Preencha todos os campos obrigatórios corretamente', 'Fechar', { duration: 5000 });
      return;
    }

    const formValue = this.prepareSaveData();
    this.loading = true;

    const operation = formValue.id
      ? this.clienteService.updateParcial(formValue, formValue.id)
      : this.clienteService.insert(formValue);

    operation.subscribe({
      next: () => {
        this.snackBar.open('Cliente salvo com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/cliente/list']);
      },
      error: (err) => {
        this.loading = false;
        this.mostrarErro(err.error?.message || 'Erro ao salvar cliente');
      }
    });
  }

  private prepareSaveData(): any {
    const formValue = this.clienteForm.value;
    return {
      id: formValue.id,
      nome: formValue.nome,
      email: formValue.email,
      senha: formValue.senha,
      cpf: formValue.cpf,
      dataNascimento: formValue.dataNascimento,
      listaTelefone: formValue.listaTelefone.map((t: any) => ({
        id: t.id,
        codArea: t.codigoArea,
        numero: t.numero
      }))
    };
  }

  mostrarErro(mensagem: string): void {
    this.dialog.open(ErrorComponent, { data: mensagem });
  }

  confirmDelete(cliente: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o cliente ${cliente.nome}?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.excluirCliente(cliente);
      }
    });
  }

  private excluirCliente(cliente: any): void {
    if (cliente.id) {
      this.clienteService.delete(cliente).subscribe({
        next: () => {
          this.snackBar.open('Cliente excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/cliente/list']);
        },
        error: (err) => {
          this.mostrarErro(err.error?.message || 'Erro ao excluir cliente');
        }
      });
    }
  }
}