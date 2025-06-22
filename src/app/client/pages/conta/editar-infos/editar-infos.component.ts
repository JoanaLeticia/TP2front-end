import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../../shared/components/template/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Cliente } from '../../../../core/models/cliente.model';
import { AuthService } from '../../../../auth/auth.service';
import { ClienteService } from '../../../../core/services/user/cliente.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Telefone } from '../../../../core/models/telefone.model';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-editar-infos',
  imports: [
    FooterComponent,
    HeaderComponent,
    MatCardModule,
    MatIcon,
    MatSpinner,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    NgxMaskDirective,
    NgxMaskPipe
  ],
  templateUrl: './editar-infos.component.html',
  styleUrls: ['./editar-infos.component.css']
})
export class EditarInfosComponent implements OnInit {
  cliente: Cliente | null = null;
  loading = true;
  error: string | null = null;
  infoForm!: FormGroup;
  senhaForm!: FormGroup;
  telefones: Telefone[] = [];
  editandoTelefone: number | null = null;

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.inicializarFormularios();
    this.carregarDadosUsuario();
  }

  inicializarFormularios(): void {
    this.infoForm = this.fb.group({
      nome: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      cpf: ['', Validators.required],
      telefone: [''],
      email: [{ value: '', disabled: true }]
    });

    this.senhaForm = this.fb.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, { validator: this.confirmarSenhaValidator });
  }

  confirmarSenhaValidator(group: FormGroup): { [key: string]: any } | null {
    const novaSenha = group.get('novaSenha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;

    // Verifica se ambos campos foram tocados
    if (group.get('novaSenha')?.pristine || group.get('confirmarSenha')?.pristine) {
      return null;
    }

    return novaSenha === confirmarSenha ? null : { senhasNaoCoincidem: true };
  }

  carregarDadosUsuario(): void {
    this.authService.getClienteCompleto().subscribe({
      next: (cliente) => {
        if (cliente) {
          this.cliente = cliente;
          this.telefones = cliente.listaTelefone || [];
          this.preencherFormulario(cliente);
          this.loading = false;
        } else {
          this.error = 'Não foi possível carregar os dados do usuário.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Erro ao carregar dados do usuário.';
        this.loading = false;
        console.error('Erro ao carregar cliente:', err);
      }
    });
  }

  preencherFormulario(cliente: Cliente): void {
    this.infoForm.patchValue({
      nome: cliente.nome,
      dataNascimento: this.cliente?.dataNascimento,
      cpf: cliente.cpf,
      email: cliente.login
    });
  }

  formatarDataParaInput(data: string): string {
    if (!data) return '';
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  formatarTelefone(telefone: Telefone): string {
    return `(${telefone.codArea}) ${telefone.numero}`;
  }

  getIniciais(): string {
    if (!this.cliente?.nome) return 'US';
    const nomes = this.cliente.nome.split(' ');
    let iniciais = '';
    if (nomes.length > 0) iniciais += nomes[0][0].toUpperCase();
    if (nomes.length > 1) iniciais += nomes[nomes.length - 1][0].toUpperCase();
    return iniciais || 'US';
  }

  adicionarTelefone(): void {
    const telefoneValue = this.infoForm.get('telefone')?.value;
    if (!telefoneValue) return;

    // Remove todos os caracteres não numéricos
    const numeros = telefoneValue.replace(/\D/g, '');

    // Verifica se tem o número mínimo de dígitos (10 para DDD + número)
    if (numeros.length < 10 || numeros.length > 11) {
      this.snackBar.open('Número de telefone inválido!', 'Fechar', { duration: 3000 });
      return;
    }

    const codArea = numeros.substring(0, 2);
    const numero = numeros.substring(2);

    const novoTelefone: Telefone = {
      id: 0, // ID será gerado pelo backend
      codArea: codArea,
      numero: numero
    };

    this.telefones.push(novoTelefone);
    this.infoForm.get('telefone')?.reset();
  }

  editarTelefone(index: number): void {
    this.editandoTelefone = index;
    const telefone = this.telefones[index];
    // Formata o telefone para o padrão (XX) XXXXX-XXXX
    const numeroFormatado = telefone.numero.length === 8 ?
      `${telefone.numero.substring(0, 4)}-${telefone.numero.substring(4)}` :
      `${telefone.numero.substring(0, 5)}-${telefone.numero.substring(5)}`;
    this.infoForm.get('telefone')?.setValue(`(${telefone.codArea}) ${numeroFormatado}`);
  }

  atualizarTelefone(): void {
    if (this.editandoTelefone === null) return;

    const telefoneValue = this.infoForm.get('telefone')?.value;
    const regex = /\((\d{2})\) (\d{4,5})-?(\d{4})/;
    const match = telefoneValue.match(regex);

    if (match) {
      // Apenas atualiza o telefone existente (mantém o ID)
      const telefoneEditado = this.telefones[this.editandoTelefone];
      telefoneEditado.codArea = match[1];
      telefoneEditado.numero = match[2] + match[3];

      this.editandoTelefone = null;
      this.infoForm.get('telefone')?.reset();
    }
  }

  removerTelefone(index: number): void {
    this.telefones.splice(index, 1);
  }

  salvarInformacoes(): void {
    if (this.infoForm.invalid || !this.cliente) return;

    const formValue = this.infoForm.getRawValue();

    const dadosAtualizacao = {
      nome: formValue.nome,
      dataNascimento: formValue.dataNascimento,
      cpf: formValue.cpf,
      listaTelefone: this.telefones.map(t => ({
        id: t.id,
        codArea: t.codArea,
        numero: t.numero
      }))
    };

    console.log('Dados enviados para atualização:', JSON.stringify(dadosAtualizacao, null, 2));

    this.loading = true;
    this.clienteService.updateParcial(
      dadosAtualizacao, this.cliente.id
    ).subscribe({
      next: () => {
        this.snackBar.open('Informações atualizadas com sucesso!', 'Fechar', { duration: 3000 });
        this.carregarDadosUsuario();
      },
      error: (err) => {
        this.error = 'Erro ao atualizar informações.';
        this.loading = false;
        this.snackBar.open('Erro ao atualizar informações!', 'Fechar', { duration: 3000 });
        console.error('Erro ao atualizar cliente:', err);
      }
    });
  }

  alterarSenha(): void {
    if (this.senhaForm.invalid) return;

    const { senhaAtual, novaSenha } = this.senhaForm.value;

    this.loading = true;
    this.clienteService.alterarSenha(senhaAtual, novaSenha).subscribe({
      next: (response) => {
        this.snackBar.open(
          response.message || 'Senha alterada com sucesso!',
          'Fechar',
          { duration: 3000 }
        );
        this.senhaForm.reset();
      },
      error: (err) => {
        this.snackBar.open(
          err.message || 'Erro ao alterar senha!',
          'Fechar',
          { duration: 3000 }
        );
      },
      complete: () => this.loading = false
    });
  }

  cancelarEdicao(): void {
    if (this.cliente) {
      this.preencherFormulario(this.cliente);
      this.telefones = [...this.cliente.listaTelefone || []];
    }
  }

  logout(): void {
    this.authService.removeToken();
    this.authService.removeUsuarioLogado();
    this.router.navigate(['/login']);
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }
}