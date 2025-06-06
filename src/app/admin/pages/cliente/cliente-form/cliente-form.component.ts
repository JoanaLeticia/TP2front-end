import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../../../core/models/cliente.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClienteService } from '../../../../core/services/user/cliente.service';
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
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent {
  clientes: Cliente[] = [];
  telefones: Telefone[] = [];

  formCliente!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private clienteService: ClienteService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const cliente: Cliente = this.activatedRoute.snapshot.data['cliente'];

    this.formCliente = this.formBuilder.group({
      id: [(cliente && cliente.id)],
      nome: [(cliente && cliente.nome) ? cliente.nome : '',
      Validators.compose([Validators.required, Validators.maxLength(60)])
      ],
      email: [(cliente && cliente.email) ? cliente.email : '', Validators.required],
      senha: [(cliente && cliente.senha) ? cliente.senha : '', Validators.required],
      cpf: [(cliente && cliente.cpf) ? cliente.cpf : '', Validators.required],
      dataNascimento: [(cliente && cliente.dataNascimento) ? cliente.dataNascimento : '', Validators.required],
      listaTelefones: this.formBuilder.array([
        this.createTelefoneFormGroup()]),
      listaEnderecos: this.formBuilder.array([
        this.createEnderecoFormGroup()])
    });

    if (cliente) {
      this.preencherFormulario(cliente);
    }
  }

  preencherFormulario(cliente: Cliente): void {
    // Preenche campos básicos
    this.formCliente.patchValue({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      senha: cliente.senha,
      cpf: cliente.cpf,
      dataNascimento: cliente.dataNascimento
    });

    // Preenche telefones
    if (cliente.listaTelefones && cliente.listaTelefones.length > 0) {
      const telefonesArray = this.formCliente.get('listaTelefones') as FormArray;
      telefonesArray.clear(); // Limpa o array existente
      cliente.listaTelefones.forEach(telefone => {
        telefonesArray.push(this.formBuilder.group({
          codigoArea: [telefone.codigoArea, Validators.required],
          numero: [telefone.numero, Validators.required]
        }));
      });
    }

    // Preenche endereços
    if (cliente.listaEnderecos && cliente.listaEnderecos.length > 0) {
      const enderecosArray = this.formCliente.get('listaEnderecos') as FormArray;
      enderecosArray.clear(); // Limpa o array existente
      cliente.listaEnderecos.forEach(endereco => {
        enderecosArray.push(this.formBuilder.group({
          logradouro: [endereco.logradouro, Validators.required],
          numero: [endereco.numbero, Validators.required],
          complemento: [endereco.complemento, Validators.required],
          bairro: [endereco.bairro, Validators.required],
          cep: [endereco.cep, Validators.required]
        }));
      });
    }

    console.log('Dados do cliente recebidos:', cliente);
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

  get listaTelefones(): FormArray {
    return this.formCliente.get('listaTelefones') as FormArray;
  }

  adicionarTelefone() {
    this.listaTelefones.push(this.createTelefoneFormGroup());
  }

  removerTelefone(index: number) {
    this.listaTelefones.removeAt(index);
  }

  get listaEnderecos(): FormArray {
    return this.formCliente.get('listaEnderecos') as FormArray;
  }

  adicionarEndereco() {
    this.listaEnderecos.push(this.createEnderecoFormGroup());
  }

  removerEndereco(index: number) {
    this.listaEnderecos.removeAt(index);
  }

  salvar() {
    console.log('Entrou no salvar');
    console.log('Formulário:', this.formCliente.value);
    console.log('Formulário válido:', this.formCliente.valid);

    if (this.formCliente.valid) {
      const cliente = this.formCliente.value;
      if (cliente.id == null) {
        this.clienteService.insert(cliente).subscribe({
          next: (clienteService) => {
            console.log('Formulário inserido ', this.formCliente.value);
            this.router.navigateByUrl('/cliente/list');
          },
          error: (err) => {
            console.log('Erro ao Incluir' + JSON.stringify(err));
            if (err instanceof HttpErrorResponse && err.error && err.error.errors && err.error.errors.length > 0) {
              const errorMessage = err.error.errors[0].message;
              this.mostrarErro(errorMessage);
            } else {
              this.mostrarErro('Erro ao criar cliente: ' + err.message);
            }
          }
        });
      } else {
        this.clienteService.update(cliente).subscribe({
          next: (clienteService) => {
            this.router.navigateByUrl('/cliente/list');
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
    if (this.formCliente.valid) {
      const cliente = this.formCliente.value;
      if (cliente.id != null) {
        this.clienteService.delete(cliente).subscribe({
          next: () => {
            this.router.navigateByUrl('/cliente/list');
          },
          error: (err) => {
            console.log('Erro ao Excluir' + JSON.stringify(err));
          }
        });
      }
    }
  }

  confirmDelete(cliente: Cliente): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true && cliente && cliente.id !== undefined) {
        this.clienteService.delete(cliente).subscribe(
          () => {
            this.clientes = this.clientes.filter(adm => adm.id !== cliente.id);

            this.router.navigateByUrl('/cliente/list');
          },
          error => {
            console.log('Erro ao excluir cliente:', error);
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