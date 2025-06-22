import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, NgModel, FormsModule } from '@angular/forms';
import { Endereco } from '../../../../core/models/endereco.model';
import { EnderecoService } from '../../../../core/services/utils/endereco.service';
import { AuthService } from '../../../../auth/auth.service';
import { Estado } from '../../../../core/models/estado.model';
import { Municipio } from '../../../../core/models/municipio.model';
import { MunicipioService } from '../../../../core/services/utils/municipio.service';
import { Cliente } from '../../../../core/models/cliente.model';
import { ClienteService } from '../../../../core/services/user/cliente.service';
import { FooterComponent } from '../../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../../shared/components/template/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-editar-endereco',
  templateUrl: './editar-endereco.component.html',
  styleUrls: ['./editar-endereco.component.css'],
  imports: [FooterComponent, HeaderComponent, MatCardModule, CommonModule, MatSpinner, MatIcon, FormsModule, ReactiveFormsModule]
})
export class EditarEnderecoComponent implements OnInit {
  cliente: Cliente | null = null;
  endereco: Endereco | null = null;
  loading = true;
  error: string | null = null;
  formSubmetido = false;
  estados: Estado[] = [];
  municipiosFiltrados: Municipio[] = [];
  estadoDropdownOpen = false;
  estadoSearchTerm = '';
  verificandoMunicipio = false;

  enderecoForm = {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    nomeMunicipio: '',
    municipio: null as Municipio | null,
    estado: null as Estado | null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enderecoService: EnderecoService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private municipioService: MunicipioService,
    private clienteService: ClienteService
  ) { }

  ngOnInit(): void {
    this.carregarEstados();
    this.carregarDadosUsuario();

    const enderecoId = this.route.snapshot.params['id'];
    if (enderecoId) {
      this.carregarEndereco(enderecoId);
    } else {
      this.loading = false;
    }

    document.addEventListener('click', this.closeEstadoDropdownOnClickOutside.bind(this));
  }

  closeEstadoDropdownOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.estado-select-container')) {
      this.estadoDropdownOpen = false;
    }
  }

  carregarDadosUsuario(): void {
    this.authService.getClienteCompleto().subscribe({
      next: (cliente) => {
        this.cliente = cliente;
      },
      error: (err) => {
        console.error('Erro ao carregar cliente:', err);
      }
    });
  }

  carregarEndereco(id: number): void {
    this.loading = true;
    this.enderecoService.findById(id).subscribe({
      next: (endereco) => {
        this.endereco = endereco;
        this.preencherFormulario(endereco);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar endereço';
        this.loading = false;
      }
    });
  }

  preencherFormulario(endereco: Endereco): void {
    this.enderecoForm = {
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento || '',
      bairro: endereco.bairro,
      cep: endereco.cep,
      nomeMunicipio: endereco.municipio.nome,
      municipio: endereco.municipio,
      estado: endereco.municipio.estado
    };
  }

  carregarEstados(): void {
    this.municipioService.getEstados().subscribe(estados => {
      this.estados = estados;
    });
  }

  get filteredEstados(): Estado[] {
    if (!this.estadoSearchTerm) return this.estados;
    return this.estados.filter(estado =>
      estado.nome.toLowerCase().includes(this.estadoSearchTerm.toLowerCase()) ||
      estado.sigla.toLowerCase().includes(this.estadoSearchTerm.toLowerCase())
    );
  }

  toggleEstadoDropdown(): void {
    this.estadoDropdownOpen = !this.estadoDropdownOpen;
    if (this.estadoDropdownOpen) {
      this.estadoSearchTerm = '';
    }
  }

  selectEstado(estado: Estado): void {
    this.enderecoForm.estado = estado;
    this.enderecoForm.municipio = null;
    this.enderecoForm.nomeMunicipio = '';
    this.estadoDropdownOpen = false;
    this.onEstadoChange();
  }

  onEstadoChange(): void {
    if (this.enderecoForm.estado) {
      this.municipioService.findByEstado(this.enderecoForm.estado.id).subscribe({
        next: (municipios) => {
          this.municipiosFiltrados = municipios;
        },
        error: (err) => {
          console.error('Erro ao carregar municípios:', err);
          this.municipiosFiltrados = [];
        }
      });
    } else {
      this.municipiosFiltrados = [];
    }
  }

  verificarMunicipioExistente(): void {
    if (!this.enderecoForm.nomeMunicipio || !this.enderecoForm.estado) return;

    this.verificandoMunicipio = true;
    this.municipioService.findByNomeSemPaginacao(this.enderecoForm.nomeMunicipio).subscribe({
      next: (municipios: Municipio[]) => {
        const municipioExistente = municipios.find(m =>
          m.nome.toLowerCase() === this.enderecoForm.nomeMunicipio.toLowerCase() &&
          m.estado.id === this.enderecoForm.estado?.id
        );
        this.enderecoForm.municipio = municipioExistente || null;
        this.verificandoMunicipio = false;
      },
      error: (err) => {
        console.error('Erro ao verificar município:', err);
        this.enderecoForm.municipio = null;
        this.verificandoMunicipio = false;
      }
    });
  }

  async salvarEndereco(): Promise<void> {
    this.formSubmetido = true;

    if (!this.validarEndereco()) {
      return;
    }

    const clienteId = this.authService.getClienteId();
    if (!clienteId || !this.endereco) {
      this.snackBar.open('Erro ao identificar cliente ou endereço', 'Fechar', { duration: 5000 });
      return;
    }

    try {
      let municipioId: number;

      if (!this.enderecoForm.municipio) {
        const novoMunicipio = {
          id: 0,
          nome: this.enderecoForm.nomeMunicipio,
          idEstado: this.enderecoForm.estado!.id
        };

        const municipioCriado = await this.municipioService.insert(novoMunicipio).toPromise();
        if (!municipioCriado) throw new Error('Falha ao criar município');
        municipioId = municipioCriado.id;
      } else {
        municipioId = this.enderecoForm.municipio.id;
      }

      const enderecoDTO = {
        id: this.endereco.id,
        logradouro: this.enderecoForm.logradouro,
        numero: this.enderecoForm.numero,
        complemento: this.enderecoForm.complemento,
        bairro: this.enderecoForm.bairro,
        cep: this.enderecoForm.cep,
        idMunicipio: municipioId,
        idCliente: clienteId
      };

      this.enderecoService.update(enderecoDTO).subscribe({
        next: (enderecoAtualizado) => {
          this.snackBar.open('Endereço atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/gameverse/conta/meus-enderecos']);
        },
        error: (err) => {
          console.error('Erro ao atualizar endereço:', err);
          this.snackBar.open('Erro ao atualizar endereço', 'Fechar', { duration: 5000 });
        }
      });
    } catch (error) {
      console.error('Erro:', error);
      this.snackBar.open('Erro ao processar município', 'Fechar', { duration: 5000 });
    }
  }

  private validarEndereco(): boolean {
    if (!this.enderecoForm.estado || !this.enderecoForm.nomeMunicipio) {
      this.snackBar.open('Selecione um estado e informe o município', 'Fechar', { duration: 5000 });
      return false;
    }

    if (!this.enderecoForm.logradouro || !this.enderecoForm.numero ||
      !this.enderecoForm.bairro || !this.enderecoForm.cep) {
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', { duration: 5000 });
      return false;
    }

    return true;
  }

  formatarCEP(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    this.enderecoForm.cep = value;
    event.target.value = value;
  }

  getIniciais(): string {
    if (!this.cliente?.nome) return 'US';
    const nomes = this.cliente.nome.split(' ');
    let iniciais = '';
    if (nomes.length > 0) iniciais += nomes[0][0].toUpperCase();
    if (nomes.length > 1) iniciais += nomes[nomes.length - 1][0].toUpperCase();
    return iniciais || 'US';
  }

  cancelarEdicao(): void {
    if (this.endereco) {
      this.preencherFormulario(this.endereco);
    } else {
      this.router.navigate(['/gameverse/conta/meus-enderecos']);
    }
  }

  logout(): void {
    this.authService.removeToken();
    this.authService.removeUsuarioLogado();
    this.router.navigate(['/gameverse/login']);
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }
}