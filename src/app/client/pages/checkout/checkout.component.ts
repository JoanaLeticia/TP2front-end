import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Endereco } from '../../../core/models/endereco.model';
import { EnderecoService } from '../../../core/services/utils/endereco.service';
import { AuthService } from '../../../auth/auth.service';
import { ItemPedido } from '../../../core/models/item-pedido.model';
import { PedidoService } from '../../../core/services/order/pedido.service';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { CommonModule, CurrencyPipe, NgFor } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Estado } from '../../../core/models/estado.model';
import { Municipio } from '../../../core/models/municipio.model';
import { MunicipioService } from '../../../core/services/utils/municipio.service';
import { Pagamento } from '../../../core/models/pagamento.model';

@Component({
  standalone: true,
  imports: [
    HeaderComponent, FooterComponent, MatCardHeader, MatCardTitle, MatCardContent, MatCard, FormsModule, MatRadioModule, MatIcon, MatFormFieldModule, MatOptionModule, CurrencyPipe, CommonModule, MatInputModule, MatSelectModule, MatIcon
  ],
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  carrinhoItens: ItemPedido[] = [];
  enderecos: Endereco[] = [];
  enderecoSelecionado: Endereco | null = null;
  mostrarFormularioEndereco = false;
  verificandoMunicipio = false;
  mostrarFormularioEdicao = false;
  enderecoEditando: any = null;
  formSubmetido = false;

  novoEndereco = {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    nomeMunicipio: '',
    municipio: null as Municipio | null,
    estado: null as Estado | null
  };

  estados: Estado[] = []; // Lista de estados disponíveis
  municipiosFiltrados: Municipio[] = [];

  metodosPagamento = [
    { id: 1, nome: 'Cartão de Crédito', descricao: 'Pague com seu cartão de crédito' },
    { id: 3, nome: 'PIX', descricao: 'Pagamento instantâneo via PIX' },
    { id: 4, nome: 'Boleto Bancário', descricao: 'Pague em qualquer agência bancária' }
  ];

  metodoPagamento: any = null;
  dadosCartao = {
    numero: '',
    validade: '',
    cvv: '',
    nome: '',
    parcelas: 1
  };

  estadoDropdownOpen = false;
  estadoSearchTerm = '';

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
    this.novoEndereco.estado = estado;
    this.novoEndereco.municipio = null;
    this.novoEndereco.nomeMunicipio = '';
    this.estadoDropdownOpen = false;
    this.onEstadoChange();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enderecoService: EnderecoService,
    private authService: AuthService,
    private pedidoService: PedidoService,
    private snackBar: MatSnackBar,
    private carrinhoService: CarrinhoService,
    private municipioService: MunicipioService
  ) { }

  ngOnInit(): void {
    console.log('CheckoutComponent iniciado');
    console.log('Itens do carrinho: ', this.route.snapshot.data['carrinhoItens']);
    this.carrinhoItens = this.route.snapshot.data['carrinhoItens'] || [];

    if (this.carrinhoItens.length === 0) {
      this.router.navigate(['/gameverse/carrinho']);
      return;
    }

    this.carregarEnderecos();
    this.carregarEstados();

    document.addEventListener('click', this.closeEstadoDropdownOnClickOutside.bind(this));
  }

  closeEstadoDropdownOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.estado-select-container')) {
      this.estadoDropdownOpen = false;
    }
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeEstadoDropdownOnClickOutside);
  }

  carregarEnderecos(): void {
    console.log('Iniciando carregamento de endereços...');

    this.authService.getClienteCompleto().subscribe({
      next: (cliente: any) => {
        console.log('Cliente recebido do serviço:', cliente);

        // Verifica os nomes alternativos da propriedade
        const enderecos = cliente.listaEndereco || [];
        console.log('Endereços encontrados:', enderecos);

        this.enderecos = enderecos;

        if (this.enderecos.length > 0) {
          this.enderecoSelecionado = this.enderecos[0];
        }
      },
      error: (error) => {
        console.error('Erro ao carregar endereços:', error);
        this.snackBar.open('Erro ao carregar endereços', 'Fechar', {
          duration: 5000,
          panelClass: ['custom-snackbar']
        });
      }
    });
  }

  carregarEstados(): void {
    this.municipioService.getEstados().subscribe(estados => {
      this.estados = estados;
    });
  }

  onEstadoChange(): void {
    const estado = this.mostrarFormularioEdicao ? this.enderecoEditando.estado : this.novoEndereco.estado;

    if (estado) {
      this.municipioService.findByEstado(estado.id).subscribe({
        next: (municipios) => {
          this.municipiosFiltrados = municipios;
          if (this.mostrarFormularioEdicao) {
            this.enderecoEditando.municipio = null;
            this.novoEndereco.municipio = null;
            this.novoEndereco.nomeMunicipio = '';
          }
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
    if (!this.novoEndereco.nomeMunicipio || !this.novoEndereco.estado) return;

    this.verificandoMunicipio = true;

    this.municipioService.findByNomeSemPaginacao(this.novoEndereco.nomeMunicipio).subscribe({
      next: (municipios: Municipio[]) => {
        const municipioExistente = municipios.find(m =>
          m.nome.toLowerCase() === this.novoEndereco.nomeMunicipio.toLowerCase() &&
          m.estado.id === this.novoEndereco.estado?.id
        );

        this.novoEndereco.municipio = municipioExistente || null;
        this.verificandoMunicipio = false;
      },
      error: (err) => {
        console.error('Erro ao verificar município:', err);
        this.novoEndereco.municipio = null;
        this.verificandoMunicipio = false;
      }
    });
  }

  async adicionarNovoEndereco(): Promise<void> {
    console.log('[1] Início do método adicionarNovoEndereco');


    const clienteId = this.authService.getClienteId();
    console.log('[2] Cliente ID:', clienteId);

    if (!clienteId) {
      console.log('[3] Cliente não autenticado');
      this.snackBar.open('Usuário não autenticado', 'Fechar', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (!this.validarEndereco()) {
      console.log('[4] Validação do endereço falhou');
      return;
    }

    console.log('[5] Dados do novo endereço:', JSON.stringify(this.novoEndereco));

    // Verificação explícita
    if (!this.novoEndereco.estado || !this.novoEndereco.nomeMunicipio) {
      this.snackBar.open('Selecione um estado e informe o município', 'Fechar', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
      return;
    }

    try {
      let municipioId: number;

      // Se não encontramos o município existente, cria um novo
      if (!this.novoEndereco.municipio) {
        console.log('[6] Município não existe, criando novo...');

        const novoMunicipio = {
          id: 0,
          nome: this.novoEndereco.nomeMunicipio,
          idEstado: this.novoEndereco.estado.id
        };

        console.log('[7] Dados para criar município:', JSON.stringify(novoMunicipio));

        const municipioCriado = await this.municipioService.insert(novoMunicipio).toPromise();
        console.log('[8] Resposta da criação do município:', municipioCriado);

        if (!municipioCriado) {
          console.error('[9] Falha ao criar município - resposta vazia');
          throw new Error('Falha ao criar município');
        }

        municipioId = municipioCriado.id;
        console.log('[10] Novo município criado com ID:', municipioId);
      } else {
        municipioId = this.novoEndereco.municipio.id;
        console.log('[11] Usando município existente ID:', municipioId);
      }

      const enderecoDTO = {
        logradouro: this.novoEndereco.logradouro,
        numero: this.novoEndereco.numero,
        complemento: this.novoEndereco.complemento,
        bairro: this.novoEndereco.bairro,
        cep: this.novoEndereco.cep,
        idMunicipio: municipioId,
        idCliente: clienteId
      };

      console.log('[12] DTO para criar endereço:', JSON.stringify(enderecoDTO));

      this.enderecoService.insert(enderecoDTO).subscribe({
        next: (endereco) => {
          console.log('[13] Endereço criado com sucesso:', endereco);
          this.enderecos.push(endereco);
          this.enderecoSelecionado = endereco;
          this.mostrarFormularioEndereco = false;
          this.resetarFormularioEndereco();
          this.snackBar.open('Endereço adicionado com sucesso!', 'Fechar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('[14] Erro ao criar endereço:', err);
          this.snackBar.open('Erro ao adicionar endereço', 'Fechar', {
            duration: 5000,
            panelClass: ['custom-snackbar']
          });
        }
      });
    } catch (error) {
      console.error('Erro:', error);
      this.snackBar.open('Erro ao processar município', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  editarEndereco(endereco: Endereco): void {
    this.mostrarFormularioEdicao = true;
    this.enderecoEditando = { ...endereco };
    this.novoEndereco = {
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento || '',
      bairro: endereco.bairro,
      cep: endereco.cep,
      nomeMunicipio: endereco.municipio.nome,
      municipio: endereco.municipio,
      estado: endereco.municipio.estado
    };

    this.onEstadoChange();
  }

  cancelarEdicao(): void {
    this.mostrarFormularioEdicao = false;
    this.enderecoEditando = null;
    this.resetarFormularioEndereco();
  }

  async salvarEdicao(): Promise<void> {
    console.log('[1] Início do método salvarEdicao');

    if (!this.validarEndereco()) {
      console.log('[2] Validação do endereço falhou');
      return;
    }

    const clienteId = this.authService.getClienteId();
    console.log('[3] Cliente ID:', clienteId);

    if (!clienteId) {
      console.log('[4] Cliente não autenticado');
      this.snackBar.open('Usuário não autenticado', 'Fechar', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (!this.novoEndereco.estado || !this.novoEndereco.nomeMunicipio) {
      this.snackBar.open('Selecione um estado e informe o município', 'Fechar', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
      return;
    }

    try {
      let municipioId: number;

      // Se não encontramos o município existente, cria um novo
      if (!this.novoEndereco.municipio) {
        console.log('[6] Município não existe, criando novo...');

        const novoMunicipio = {
          id: 0,
          nome: this.novoEndereco.nomeMunicipio,
          idEstado: this.novoEndereco.estado.id
        };

        console.log('[7] Dados para criar município:', JSON.stringify(novoMunicipio));

        const municipioCriado = await this.municipioService.insert(novoMunicipio).toPromise();
        console.log('[8] Resposta da criação do município:', municipioCriado);

        if (!municipioCriado) {
          console.error('[9] Falha ao criar município - resposta vazia');
          throw new Error('Falha ao criar município');
        }

        municipioId = municipioCriado.id;
        console.log('[10] Novo município criado com ID:', municipioId);
      } else {
        municipioId = this.novoEndereco.municipio.id;
        console.log('[11] Usando município existente ID:', municipioId);
      }

      // Prepara o DTO para atualização
      const enderecoDTO = {
        id: this.enderecoEditando.id,
        logradouro: this.novoEndereco.logradouro,
        numero: this.novoEndereco.numero,
        complemento: this.novoEndereco.complemento,
        bairro: this.novoEndereco.bairro,
        cep: this.novoEndereco.cep,
        idMunicipio: municipioId,
        idCliente: clienteId
      };

      console.log('[11] DTO para atualização:', JSON.stringify(enderecoDTO));
      console.log('[12] ID do endereço a ser atualizado:', this.enderecoEditando.id);

      this.enderecoService.update(enderecoDTO).subscribe({
        next: (enderecoAtualizado) => {
          if (!enderecoAtualizado) {
            throw new Error('Resposta de atualização vazia');
          }
          console.log('[13] Endereço atualizado com sucesso:', enderecoAtualizado);

          // Atualiza a lista de endereços
          const index = this.enderecos.findIndex(e => e.id === enderecoAtualizado.id);
          if (index !== -1) {
            this.enderecos[index] = enderecoAtualizado;
          }

          // Atualiza o endereço selecionado se for o mesmo
          if (this.enderecoSelecionado?.id === enderecoAtualizado.id) {
            this.enderecoSelecionado = enderecoAtualizado;
          }

          this.snackBar.open('Endereço atualizado com sucesso!', 'Fechar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });

          this.mostrarFormularioEdicao = false;
          this.enderecoEditando = null;
          this.resetarFormularioEndereco();
        },
        error: (err) => {
          console.error('[14] Erro ao atualizar endereço:', err);
          this.snackBar.open('Erro ao atualizar endereço', 'Fechar', {
            duration: 5000,
            panelClass: ['custom-snackbar']
          });
        }
      });
    } catch (error) {
      console.error('[15] Erro no processo de atualização:', error);
      this.snackBar.open('Erro ao processar atualização do endereço', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }


  private validarEndereco(): boolean {
    if (!this.novoEndereco.estado || !this.novoEndereco.nomeMunicipio) {
      this.snackBar.open('Selecione um estado e informe o município', 'Fechar', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
      return false;
    }

    if (!this.novoEndereco.logradouro || !this.novoEndereco.numero ||
      !this.novoEndereco.bairro || !this.novoEndereco.cep) {
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
      return false;
    }

    return true;
  }

  resetarFormularioEndereco(): void {
    this.novoEndereco = {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cep: '',
      nomeMunicipio: '',
      municipio: null,
      estado: null
    };
    this.municipiosFiltrados = [];
  }

  formatarCEP(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    this.novoEndereco.cep = value;
    event.target.value = value;
  }

  calcularTotal(): number {
    return this.carrinhoItens.reduce(
      (total, item) => total + (item.valor * item.quantidade), 0
    );
  }

  calcularParcela(parcelas: number): number {
    return this.calcularTotal() / parcelas;
  }

  finalizarPedido(): void {
    this.formSubmetido = true;

    if (!this.enderecoSelecionado || !this.metodoPagamento) {
      this.snackBar.open('Selecione um endereço e método de pagamento', 'Fechar', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (this.metodoPagamento.id === 1) {
      if (!this.dadosCartao.numero || !this.validarValidade() ||
        !this.dadosCartao.cvv || !this.dadosCartao.nome) {
        return;
      }

      if (this.dadosCartao.numero.replace(/\s/g, '').length < 16) {
        return;
      }
    }

    const pagamento = {
      idMetodo: this.metodoPagamento.id,
      numeroCartao: this.metodoPagamento.id === 1 ? this.dadosCartao.numero : undefined,
      parcelas: this.metodoPagamento.id === 1 ? this.dadosCartao.parcelas : undefined,
      pedidoId: 0
    };

    console.log("Pagamento cadastrado: ", pagamento);

    const pedido = {
      itens: this.carrinhoItens.map(item => ({
        idProduto: item.id,
        quantidade: item.quantidade
      })),
      enderecoId: this.enderecoSelecionado.id,
      pagamento
    };

    this.pedidoService.insert(pedido).subscribe({
      next: (response) => {
        const pedidoId = response.id || response.idPedido;
        this.snackBar.open(`Pedido #${pedidoId} criado com sucesso!`, 'Fechar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });

        this.carrinhoService.limparCarrinho();

        console.log('Pedido feito com sucesso: ', pedido);

        this.router.navigate(['/gameverse/pedidoconfirmado']);
      },
      error: (error) => {
        console.error('Erro ao criar pedido:', error);
        this.snackBar.open('Erro ao finalizar pedido', 'Fechar', {
          duration: 5000,
          panelClass: ['custom-snackbar']
        });
      }
    });
  }

  selecionarEndereco(endereco: Endereco): void {
    this.enderecoSelecionado = this.enderecoSelecionado === endereco ? null : endereco;
  }

  // FORMATAÇÃO DOS INPUTS

  formatarNumeroCartao(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }

    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.dadosCartao.numero = formatted;
    event.target.value = formatted;
  }

  validarValidade(): boolean {
    if (!this.dadosCartao.validade) return false;

    const partes = this.dadosCartao.validade.split('/');
    if (partes.length !== 2) return false;

    const mes = parseInt(partes[0], 10);
    const ano = parseInt(partes[1], 10);

    if (mes < 1 || mes > 12) return false;

    const anoAtual = new Date().getFullYear() % 100;
    const anoLimite = anoAtual + 10;

    if (ano < anoAtual || ano > anoLimite) return false;

    return true;
  }

  validarCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.substring(0, 3);
    }

    this.dadosCartao.cvv = value;
    event.target.value = value;
  }

  formatarValidade(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    if (value.length > 5) {
      value = value.substring(0, 5);
    }

    this.dadosCartao.validade = value;
    event.target.value = value;
  }
}