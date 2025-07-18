import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Endereco } from '../../../core/models/endereco.model';
import { EnderecoService } from '../../../core/services/utils/endereco.service';
import { AuthService } from '../../../auth/auth.service';
import { ItemPedido } from '../../../core/models/item-pedido.model';
import { PedidoService } from '../../../core/services/order/pedido.service';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { CommonModule, CurrencyPipe, NgFor } from '@angular/common';
import { HeaderSimplificadoComponent } from '../../../shared/components/template/header-simplificado/header-simplificado.component';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Estado } from '../../../core/models/estado.model';
import { Municipio } from '../../../core/models/municipio.model';
import { MunicipioService } from '../../../core/services/utils/municipio.service';
import { Pagamento } from '../../../core/models/pagamento.model';
import { Cupom } from '../../../core/models/cupom.model';
import { CupomService } from '../../../core/services/order/cupom.service';
import { FreteOption } from '../../../core/models/frete-option.model';
import { FreteService } from '../../../core/services/order/frete.service';
import { CepService } from '../../../core/services/utils/cep.service';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MetodoPagamento } from '../../../core/models/metodo-pagamento.model';

@Component({
  standalone: true,
  imports: [
    HeaderSimplificadoComponent, FooterComponent, MatCardHeader, MatCardTitle, MatCardContent, MatCard, FormsModule, MatRadioModule, MatIcon, MatFormFieldModule, MatOptionModule, CurrencyPipe, CommonModule, MatInputModule, MatSelectModule, MatIcon, MatProgressSpinnerModule
  ],
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, height: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, height: 0, overflow: 'hidden' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
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
  private inactivityTimer: any;
  pedidoFinalizado: boolean = false;
  codigoCupom: string = '';
  cupomAplicado: Cupom | null = null;
  desconto: number = 0;
  freteForm: FormGroup;
  opcoesFrete: FreteOption[] = [];
  freteSelecionado: FreteOption | null = null;
  calculandoFrete = false;
  erroFrete: string | null = null;
  cepValido: boolean | null = null;
  cepCarregando = false;
  parcelasDisponiveis: any[] = [];
  enderecoFaturamentoNovo: boolean = false;
  mostrarFormularioEnderecoFaturamento = false;
  estadoDropdownOpenFaturamento = false;
  estadoSearchTermFaturamento = '';
  salvarEnderecoFaturamento: boolean = false;

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

  novoEnderecoFaturamento = {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    nomeMunicipio: '',
    municipio: null as Municipio | null,
    estado: null as Estado | null
  };

  pagamento: Pagamento = {
    pedidoId: 0,
    metodo: MetodoPagamento.CARTAO_CREDITO,
    usarEnderecoEntrega: true,
    enderecoFaturamento: undefined // Adicione esta linha
  }

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

  onUsarEnderecoEntregaChange() {
    if (this.pagamento.usarEnderecoEntrega) {
      this.pagamento.enderecoFaturamentoId = this.enderecoSelecionado?.id;
      this.mostrarFormularioEnderecoFaturamento = false;
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
    private municipioService: MunicipioService,
    private cupomService: CupomService,
    private freteService: FreteService,
    private cepService: CepService,
    private fb: FormBuilder
  ) {
    this.freteForm = this.fb.group({
      cepDestino: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]]
    });
  }

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
    this.carregarParcelas();

    document.addEventListener('click', this.closeEstadoDropdownOnClickOutside.bind(this));

    this.inactivityTimer = setTimeout(() => {
      this.router.navigate(['/carrinho']);
      this.snackBar.open('Sessão expirada por inatividade', 'Fechar', { duration: 5000 });
    }, 900000);
  }

  onCepChange() {
    const cepControl = this.freteForm.get('cepDestino');
    if (cepControl?.valid) {
      this.cepCarregando = true;
      this.cepValido = null;
      const cep = cepControl.value.replace(/\D/g, '');

      this.cepService.validarCep(cep).subscribe({
        next: (resultado) => {
          this.cepValido = resultado.valido;
          if (resultado.valido) {
            cepControl.setValue(this.cepService.formatarCep(cep), { emitEvent: false });
          } else {
            this.erroFrete = resultado.erro ?? null;
          }
          this.cepCarregando = false;
        },
        error: () => {
          this.cepValido = false;
          this.cepCarregando = false;
        }
      });
    } else {
      this.cepValido = false;
    }
  }

  get totalProdutos(): number {
    return this.carrinhoService.getTotalValor();
  }

  toggleFormularioEndereco(): void {
    this.mostrarFormularioEndereco = !this.mostrarFormularioEndereco;

    if (this.mostrarFormularioEndereco) {
      this.enderecoSelecionado = null;
      this.mostrarFormularioEdicao = false;
      this.opcoesFrete = [];
      this.freteSelecionado = null;
      this.resetarFormularioEndereco();
    }
  }


  toggleFormularioEdicao(endereco: Endereco): void {
    this.mostrarFormularioEdicao = !this.mostrarFormularioEdicao;
    if (this.mostrarFormularioEdicao) {
      this.mostrarFormularioEndereco = false;
      this.editarEndereco(endereco);
    } else {
      this.cancelarEdicao();
    }
  }

  calcularFrete(): void {
    if (!this.enderecoSelecionado) {
      this.snackBar.open('Selecione um endereço para calcular o frete', 'Fechar', {
        duration: 3000
      });
      return;
    }

    this.calculandoFrete = true;
    this.erroFrete = null;
    this.opcoesFrete = [];
    this.freteSelecionado = null;

    const cepDestino = this.enderecoSelecionado.cep.replace(/\D/g, '');

    this.freteService.calcularFreteParaCarrinho(this.carrinhoItens, cepDestino).subscribe({
      next: (resultado) => {
        this.opcoesFrete = resultado.filter(opcao => opcao.preco != null);
        this.calculandoFrete = false;

        if (this.opcoesFrete.length > 0) {
          this.freteSelecionado = this.opcoesFrete[0];
          this.calcularTotal(true); // Atualiza as parcelas
        } else {
          this.erroFrete = 'Nenhuma opção de frete disponível para este CEP';
        }
      },
      error: (erro) => {
        console.error('Erro ao calcular frete:', erro);
        this.erroFrete = erro.error?.message || 'Erro ao calcular frete. Tente novamente.';
        this.calculandoFrete = false;
        this.snackBar.open(this.erroFrete || 'Erro desconhecido', 'Fechar', { duration: 3000 });
      }
    });
  }

  selecionarFrete(opcao: FreteOption): void {
    this.freteSelecionado = opcao;
    this.calcularTotal(true);
  }

  @HostListener('document:mousemove')
  @HostListener('document:keypress')
  resetTimer() {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      this.router.navigate(['/carrinho']);
      this.snackBar.open('Sessão expirada por inatividade', 'Fechar', { duration: 5000 });
    }, 900000);
  }

  closeEstadoDropdownOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.estado-select-container')) {
      this.estadoDropdownOpen = false;
    }
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeEstadoDropdownOnClickOutside);
    clearTimeout(this.inactivityTimer);
    document.querySelector('.pagamento-card')?.classList.remove('dropdown-aberto');
  }

  carregarEnderecos(): void {
    console.log('Iniciando carregamento de endereços...');

    this.authService.getClienteCompleto().subscribe({
      next: (cliente: any) => {
        console.log('Cliente recebido do serviço:', cliente);

        const enderecos = cliente.listaEndereco || [];
        console.log('Endereços encontrados:', enderecos);

        this.enderecos = enderecos;

        if (this.enderecos.length > 0) {
          this.enderecoSelecionado = this.enderecos[0];
          this.calcularFrete(); // Calcula frete automaticamente quando carrega o primeiro endereço
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

  carregarParcelas(): void {
    if (this.metodoPagamento?.id !== 1) return;

    const total = this.calcularTotal();
    const parcelaAtual = this.dadosCartao.parcelas;

    this.parcelasDisponiveis = [];
    const maxParcelas = 12;

    for (let i = 1; i <= maxParcelas; i++) {
      const valorParcela = total / i;
      this.parcelasDisponiveis.push({
        valor: i,
        valorParcela: valorParcela,
        valorTotal: total
      });
    }

    if (parcelaAtual && parcelaAtual <= maxParcelas) {
      this.dadosCartao.parcelas = parcelaAtual;
    } else if (this.parcelasDisponiveis.length > 0) {
      this.dadosCartao.parcelas = 1;
    }
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
          this.mostrarFormularioEdicao = false;
          this.resetarFormularioEndereco();

          this.enderecoSelecionado = endereco;
          this.calcularFrete();

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
    this.mostrarFormularioEndereco = false;
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
          this.mostrarFormularioEndereco = false;
          this.enderecoEditando = null;
          this.resetarFormularioEndereco();

          if (this.enderecoSelecionado?.id === enderecoAtualizado.id) {
            this.calcularFrete();
          }
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

  aplicarCupom() {
    if (!this.codigoCupom) return;

    this.cupomService.validarCupom(this.codigoCupom).subscribe({
      next: (resposta) => {
        if (resposta.valido && resposta.cupom) {
          this.cupomAplicado = resposta.cupom;
          this.desconto = resposta.valorDesconto || 0;

          console.log('Cupom aplicado:', {
            cupom: this.cupomAplicado,
            desconto: this.desconto,
            tipo: this.cupomAplicado.tipo.nome
          });

          this.snackBar.open(resposta.mensagem || 'Cupom aplicado!', 'Fechar', {
            duration: 3000
          });

          // Atualiza as parcelas após aplicar o cupom
          this.calcularTotal(true);
        } else {
          this.snackBar.open(resposta.mensagem || 'Cupom inválido', 'Fechar', {
            duration: 3000
          });
        }
      },
      error: (erro) => {
        console.error('Erro na validação:', erro);
        this.snackBar.open('Erro ao validar cupom', 'Fechar', {
          duration: 3000
        });
      }
    });
  }

  removerCupom() {
    this.cupomAplicado = null;
    this.codigoCupom = '';
    this.desconto = 0;
    this.calcularTotal(true);
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

  calcularTotal(atualizarParcelas: boolean = false): number {
    const totalProdutos = this.carrinhoService.getTotalValor();
    const frete = this.getValorFrete();
    const total = totalProdutos + frete - this.desconto;

    if (atualizarParcelas && this.metodoPagamento?.id === 1) {
      this.carregarParcelas();
    }

    return total;
  }

  getValorFrete(): number {
    if (!this.freteSelecionado || !this.freteSelecionado.preco) return 0;

    const valor = this.freteSelecionado.preco
      .replace(/[^\d,.]/g, '')
      .replace(',', '.');

    return parseFloat(valor) || 0;
  }

  calcularParcela(parcelas: number): number {
    return this.calcularTotal() / parcelas;
  }

  async finalizarPedido(): Promise<void> {
    this.formSubmetido = true;
    this.pedidoFinalizado = false;

    console.log('[FinalizarPedido] Iniciando processo...'); // Log de depuração

    // Validações básicas
    if (!this.enderecoSelecionado || !this.metodoPagamento) {
      const msg = !this.enderecoSelecionado ? 'Selecione um endereço de entrega' : 'Selecione um método de pagamento';
      this.snackBar.open(msg, 'Fechar', { duration: 5000 });
      console.log('[FinalizarPedido] Validação falhou:', msg); // Log de depuração
      return;
    }

    // Validação específica para cartão de crédito
    if (this.metodoPagamento.id === 1) {
      if (!this.validarDadosCartao()) {
        console.log('[FinalizarPedido] Dados do cartão inválidos'); // Log de depuração
        return;
      }
    }

    // Processamento do endereço de faturamento
    try {
      // Se estiver usando endereço de entrega como faturamento
      if (this.pagamento.usarEnderecoEntrega) {
        this.pagamento.enderecoFaturamentoId = this.enderecoSelecionado.id;
        console.log('[FinalizarPedido] Usando endereço de entrega como faturamento'); // Log de depuração
      }
      // Se estiver usando um novo endereço de faturamento
      else if (this.mostrarFormularioEnderecoFaturamento) {
        console.log('[FinalizarPedido] Processando novo endereço de faturamento...'); // Log de depuração

        if (!this.validarEnderecoFaturamento()) {
          console.log('[FinalizarPedido] Endereço de faturamento inválido'); // Log de depuração
          return;
        }

        if (this.salvarEnderecoFaturamento) {
          await this.adicionarNovoEnderecoFaturamento();
        } else {
          this.pagamento.enderecoFaturamento = {
            logradouro: this.novoEnderecoFaturamento.logradouro,
            numero: this.novoEnderecoFaturamento.numero,
            complemento: this.novoEnderecoFaturamento.complemento,
            bairro: this.novoEnderecoFaturamento.bairro,
            cep: this.novoEnderecoFaturamento.cep,
            municipio: {
              id: this.novoEnderecoFaturamento.municipio?.id || 0,
              nome: this.novoEnderecoFaturamento.nomeMunicipio,
              estado: this.novoEnderecoFaturamento.estado!
            }
          };
        }
      }
      // Se nenhum endereço foi selecionado/preenchido
      else if (!this.pagamento.enderecoFaturamentoId) {
        this.snackBar.open('Selecione ou preencha um endereço de faturamento', 'Fechar', { duration: 5000 });
        console.log('[FinalizarPedido] Nenhum endereço de faturamento selecionado'); // Log de depuração
        return;
      }

      // Preparar dados do pedido
      const pagamento = {
        idMetodo: this.metodoPagamento.id,
        numeroCartao: this.metodoPagamento.id === 1 ? this.dadosCartao.numero : undefined,
        parcelas: this.metodoPagamento.id === 1 ? this.dadosCartao.parcelas : undefined,
        pedidoId: 0,
        enderecoFaturamentoId: this.pagamento.usarEnderecoEntrega ?
          this.enderecoSelecionado.id :
          this.pagamento.enderecoFaturamentoId,
        enderecoFaturamento: !this.pagamento.usarEnderecoEntrega &&
          !this.pagamento.enderecoFaturamentoId ?
          this.pagamento.enderecoFaturamento :
          undefined
      };

      console.log('[FinalizarPedido] Dados do pagamento:', pagamento); // Log de depuração

      const pedido = {
        itens: this.carrinhoItens.map(item => ({
          idProduto: item.id,
          quantidade: item.quantidade
        })),
        enderecoId: this.enderecoSelecionado.id,
        valorFrete: this.getValorFrete(),
        pagamento,
        codigoCupom: this.cupomAplicado?.codigo || null
      };

      console.log('[FinalizarPedido] Enviando pedido:', pedido); // Log de depuração

      // Enviar pedido
      this.pedidoService.insert(pedido).subscribe({
        next: (response) => {
          const pedidoId = response.id || response.idPedido;
          this.snackBar.open(`Pedido #${pedidoId} criado com sucesso!`, 'Fechar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });

          this.carrinhoService.limparCarrinho();
          this.pedidoFinalizado = true;
          this.router.navigate(['/gameverse/pedidoconfirmado']);
        },
        error: (error) => {
          console.error('[FinalizarPedido] Erro ao criar pedido:', error);
          this.snackBar.open('Erro ao finalizar pedido', 'Fechar', {
            duration: 5000,
            panelClass: ['custom-snackbar']
          });
        }
      });

    } catch (error) {
      console.error('[FinalizarPedido] Erro no processo:', error);
      this.snackBar.open('Erro ao processar pedido', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private validarDadosCartao(): boolean {
    if (!this.dadosCartao.numero || !this.validarValidade() ||
      !this.dadosCartao.cvv || !this.dadosCartao.nome) {
      this.snackBar.open('Preencha todos os dados do cartão', 'Fechar', { duration: 5000 });
      return false;
    }

    if (this.dadosCartao.numero.replace(/\s/g, '').length < 16) {
      this.snackBar.open('Número do cartão inválido', 'Fechar', { duration: 5000 });
      return false;
    }

    return true;
  }

  private validarEnderecoFaturamento(): boolean {
    if (!this.novoEnderecoFaturamento.estado) {
      this.snackBar.open('Selecione um estado válido', 'Fechar', { duration: 5000 });
      return false;
    }

    const camposObrigatorios = [
      this.novoEnderecoFaturamento.logradouro,
      this.novoEnderecoFaturamento.numero,
      this.novoEnderecoFaturamento.bairro,
      this.novoEnderecoFaturamento.cep,
      this.novoEnderecoFaturamento.nomeMunicipio
    ];

    if (camposObrigatorios.some(campo => !campo)) {
      this.snackBar.open('Preencha todos os campos obrigatórios do endereço', 'Fechar', { duration: 5000 });
      return false;
    }

    return true;
  }

  selecionarMetodoPagamento(metodo: any): void {
    this.metodoPagamento = metodo;
    this.pagamento.metodo = metodo;

    if (metodo.id === 1) {
      this.carregarParcelas();
      if (this.enderecoSelecionado) {
        this.pagamento.enderecoFaturamentoId = this.enderecoSelecionado.id;
      }
    }
  }

  selecionarEndereco(endereco: Endereco): void {
    if (this.mostrarFormularioEndereco) {
      this.mostrarFormularioEndereco = false;
    }

    if (this.mostrarFormularioEdicao) {
      this.mostrarFormularioEdicao = false;
    }

    this.enderecoSelecionado = this.enderecoSelecionado === endereco ? null : endereco;

    if (this.enderecoSelecionado) {
      this.calcularFrete();
      this.calcularTotal(true);
    } else {
      this.opcoesFrete = [];
      this.freteSelecionado = null;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    if (!this.pedidoFinalizado) {
      event.returnValue = 'Você tem certeza que deseja sair? Seu pedido não foi finalizado.';
    }
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

  formatarNumeroCartaoVisual(numero: string): string {
    return '•••• •••• •••• ' + numero.slice(-4);
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

  mostrarFormularioNovoEnderecoFaturamento(): void {
    this.mostrarFormularioEnderecoFaturamento = true;
    this.pagamento.enderecoFaturamentoId = undefined;
    this.pagamento.enderecoFaturamento = undefined;
    this.resetarFormularioEnderecoFaturamento();
  }

  cancelarNovoEnderecoFaturamento(): void {
    this.mostrarFormularioEnderecoFaturamento = false;
    this.resetarFormularioEnderecoFaturamento();
  }

  toggleEstadoDropdownFaturamento(): void {
    this.estadoDropdownOpenFaturamento = !this.estadoDropdownOpenFaturamento;
    if (this.estadoDropdownOpenFaturamento) {
      this.estadoSearchTermFaturamento = '';
      // Adiciona classe ao card
      document.querySelector('.pagamento-card')?.classList.add('dropdown-aberto');
    } else {
      // Remove classe do card
      document.querySelector('.pagamento-card')?.classList.remove('dropdown-aberto');
    }
  }

  get filteredEstadosFaturamento(): Estado[] {
    if (!this.estadoSearchTermFaturamento) return this.estados;

    return this.estados.filter(estado =>
      estado.nome.toLowerCase().includes(this.estadoSearchTermFaturamento.toLowerCase()) ||
      estado.sigla.toLowerCase().includes(this.estadoSearchTermFaturamento.toLowerCase())
    );
  }

  selectEstadoFaturamento(estado: Estado): void {
    this.novoEnderecoFaturamento.estado = estado;
    this.novoEnderecoFaturamento.municipio = null;
    this.novoEnderecoFaturamento.nomeMunicipio = '';
    this.estadoDropdownOpenFaturamento = false;
    this.estadoSearchTermFaturamento = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.estado-select-container') && this.estadoDropdownOpenFaturamento) {
      this.estadoDropdownOpenFaturamento = false;
    }
  }

  verificarMunicipioExistenteFaturamento(): void {
    if (!this.novoEnderecoFaturamento.nomeMunicipio || !this.novoEnderecoFaturamento.estado) return;

    this.municipioService.findByNomeSemPaginacao(this.novoEnderecoFaturamento.nomeMunicipio).subscribe({
      next: (municipios: Municipio[]) => {
        const municipioExistente = municipios.find(m =>
          m.nome.toLowerCase() === this.novoEnderecoFaturamento.nomeMunicipio.toLowerCase() &&
          m.estado.id === this.novoEnderecoFaturamento.estado?.id
        );
        this.novoEnderecoFaturamento.municipio = municipioExistente || null;
      },
      error: (err) => {
        console.error('Erro ao verificar município:', err);
        this.novoEnderecoFaturamento.municipio = null;
      }
    });
  }

  resetarFormularioEnderecoFaturamento(): void {
    this.novoEnderecoFaturamento = {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cep: '',
      nomeMunicipio: '',
      municipio: null,
      estado: null
    };
  }

  async adicionarNovoEnderecoFaturamento(): Promise<void> {
    const clienteId = this.authService.getClienteId();

    if (!clienteId) {
      this.snackBar.open('Usuário não autenticado', 'Fechar', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (!this.novoEnderecoFaturamento.logradouro || !this.novoEnderecoFaturamento.numero ||
      !this.novoEnderecoFaturamento.bairro || !this.novoEnderecoFaturamento.cep ||
      !this.novoEnderecoFaturamento.estado || !this.novoEnderecoFaturamento.nomeMunicipio) {
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', {
        duration: 5000,
        panelClass: ['custom-snackbar']
      });
      return;
    }

    try {
      let municipioId: number;

      if (!this.novoEnderecoFaturamento.municipio) {
        const novoMunicipio = {
          id: 0,
          nome: this.novoEnderecoFaturamento.nomeMunicipio,
          idEstado: this.novoEnderecoFaturamento.estado.id
        };

        const municipioCriado = await this.municipioService.insert(novoMunicipio).toPromise();
        if (!municipioCriado) throw new Error('Falha ao criar município');
        municipioId = municipioCriado.id;
      } else {
        municipioId = this.novoEnderecoFaturamento.municipio.id;
      }

      // Criar objeto de endereço para o pedido
      const enderecoPedido = {
        logradouro: this.novoEnderecoFaturamento.logradouro,
        numero: this.novoEnderecoFaturamento.numero,
        complemento: this.novoEnderecoFaturamento.complemento,
        bairro: this.novoEnderecoFaturamento.bairro,
        cep: this.novoEnderecoFaturamento.cep,
        municipio: {
          id: municipioId,
          nome: this.novoEnderecoFaturamento.nomeMunicipio,
          estado: this.novoEnderecoFaturamento.estado
        }
      };

      // Se o checkbox estiver marcado, salva o endereço no perfil do cliente
      if (this.salvarEnderecoFaturamento) {
        const enderecoDTO = {
          logradouro: this.novoEnderecoFaturamento.logradouro,
          numero: this.novoEnderecoFaturamento.numero,
          complemento: this.novoEnderecoFaturamento.complemento,
          bairro: this.novoEnderecoFaturamento.bairro,
          cep: this.novoEnderecoFaturamento.cep,
          idMunicipio: municipioId,
          idCliente: clienteId
        };

        this.enderecoService.insert(enderecoDTO).subscribe({
          next: (endereco) => {
            this.enderecos.push(endereco);
            this.pagamento.enderecoFaturamentoId = endereco.id;
            this.mostrarFormularioEnderecoFaturamento = false;
            this.resetarFormularioEnderecoFaturamento();
            this.salvarEnderecoFaturamento = false;

            this.snackBar.open('Endereço salvo e adicionado com sucesso!', 'Fechar', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Erro ao criar endereço:', err);
            this.snackBar.open('Erro ao salvar endereço', 'Fechar', {
              duration: 5000,
              panelClass: ['custom-snackbar']
            });
          }
        });
      } else {
        this.pagamento.enderecoFaturamento = {
          logradouro: this.novoEnderecoFaturamento.logradouro,
          numero: this.novoEnderecoFaturamento.numero,
          complemento: this.novoEnderecoFaturamento.complemento,
          bairro: this.novoEnderecoFaturamento.bairro,
          cep: this.novoEnderecoFaturamento.cep,
          municipio: {
            id: municipioId,
            nome: this.novoEnderecoFaturamento.nomeMunicipio,
            estado: this.novoEnderecoFaturamento.estado
          }
        };
        this.mostrarFormularioEnderecoFaturamento = false;
      }
    } catch (error) {
      console.error('Erro:', error);
      this.snackBar.open('Erro ao processar município', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}