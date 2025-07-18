import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { ItemPedido } from '../../../core/models/item-pedido.model';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { PedidoService } from '../../../core/services/order/pedido.service';
import { AuthService } from '../../../auth/auth.service';
import { Cliente } from '../../../core/models/cliente.model';
import { Pedido } from '../../../core/models/pedido.model';
import { map, switchMap, tap, throwError } from 'rxjs';
import { EnderecoService } from '../../../core/services/utils/endereco.service';
import { FreteOption } from '../../../core/models/frete-option.model';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { FreteService } from '../../../core/services/order/frete.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { Cupom, CupomValido } from '../../../core/models/cupom.model';
import { CupomService } from '../../../core/services/order/cupom.service';
import { CepService } from '../../../core/services/utils/cep.service';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.css'],
  providers: [provideNgxMask()],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('200ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, height: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [ // Isso dispara quando a lista muda
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
export class CarrinhoComponent implements OnInit {
  carrinhoItens: ItemPedido[] = [];
  freteForm: FormGroup;
  opcoesFrete: FreteOption[] = [];
  freteSelecionado: FreteOption | null = null;
  calculandoFrete = false;
  erroFrete: string | null = null;
  codigoCupom: string = '';
  cupomAplicado: Cupom | null = null;
  desconto: number = 0;
  cepValido: boolean | null = null;
  cepCarregando = false;

  constructor(
    private carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
    private enderecoService: EnderecoService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private freteService: FreteService,
    private fb: FormBuilder,
    private cupomService: CupomService,
    private cepService: CepService
  ) {
    this.freteForm = this.fb.group({
      cepDestino: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]]
    });
  }

  ngOnInit(): void {
    this.carrinhoService.carrinho$.subscribe(itens => {
      this.carrinhoItens = itens;

      console.log('itens:', itens);
    });
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

  calcularFrete() {
    if (this.freteForm.invalid || !this.cepValido) {
      this.snackBar.open('Por favor, insira um CEP válido', 'Fechar', {
        duration: 3000
      });
      return;
    }

    this.calculandoFrete = true;
    this.erroFrete = null;
    this.opcoesFrete = [];
    this.freteSelecionado = null;

    const cepDestino = this.freteForm.get('cepDestino')?.value.replace(/\D/g, '');

    console.log('Itens do carrinho:', this.carrinhoItens);
    console.log('CEP enviado:', cepDestino);

    this.freteService.calcularFreteParaCarrinho(this.carrinhoItens, cepDestino).subscribe({
      next: (resultado) => {
        this.opcoesFrete = resultado.filter(opcao => opcao.preco != null);
        this.calculandoFrete = false;

        if (this.opcoesFrete.length === 0) {
          this.erroFrete = 'Nenhuma opção de frete disponível para este CEP';
        }
      },
      error: (erro) => {
        console.error('Erro completo:', erro);
        this.erroFrete = erro.error?.message || 'Erro ao calcular frete. Tente novamente.';
        this.calculandoFrete = false;
        if (this.erroFrete) {
          this.snackBar.open(this.erroFrete, 'Fechar', { duration: 3000 });
        }
      }
    });
  }

  selecionarFrete(opcao: FreteOption) {
    this.freteSelecionado = opcao;
  }

  aumentarQuantidade(item: ItemPedido): void {
    console.log('Tentando aumentar quantidade para item:', {
      id: item.id,
      nome: item.nome,
      quantidadeAtual: item.quantidade,
      estoqueDisponivel: item.produto?.estoque
    });

    if (item.produto && item.quantidade >= item.produto.estoque) {
      this.snackBar.open(`Quantidade máxima disponível em estoque: ${item.produto.estoque}`, 'Fechar', {
        duration: 3000,
        panelClass: ['custom-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    this.carrinhoService.atualizarQuantidade(item.id, item.quantidade + 1);
  }

  atualizarQuantidadeManual(item: ItemPedido): void {
    if (isNaN(item.quantidade)) {
      item.quantidade = 1;
    }

    if (item.quantidade < 1) {
      item.quantidade = 1;
    }

    if (item.produto && item.quantidade > item.produto.estoque) {
      this.snackBar.open(`Quantidade indisponível. Máximo em estoque: ${item.produto.estoque}`, 'Fechar', {
        duration: 3000,
        panelClass: ['custom-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      item.quantidade = item.produto.estoque;
    }

    this.carrinhoService.atualizarQuantidade(item.id, item.quantidade);
  }

  diminuirQuantidade(item: ItemPedido): void {
    if (item.quantidade > 1) {
      this.carrinhoService.atualizarQuantidade(item.id, item.quantidade - 1);
    }
  }

  removerItem(item: ItemPedido): void {
    this.carrinhoService.removerItem(item.id);
    this.snackBar.open('Item removido do carrinho', 'Fechar', {
      duration: 3000, panelClass: ['custom-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
    });
  }

  get totalProdutos(): number {
    return this.carrinhoService.getTotalValor();
  }

  getValorFrete(): number {
    if (!this.freteSelecionado) return 0;

    const valor = this.freteSelecionado.preco.replace(/[^\d,.]/g, '')
      .replace(',', '.');
    return parseFloat(valor) || 0;
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
  }

  calcularTotal(): number {
    const totalProdutos = this.carrinhoService.getTotalValor();
    const frete = this.getValorFrete();
    return totalProdutos + frete - this.desconto;
  }

  finalizarCompra(): void {
    this.authService.getUsuarioLogado().pipe(
      tap(usuario => console.log('Usuário logado:', usuario)),

      switchMap(usuario => {
        if (!usuario) {
          console.log('Nenhum usuário logado');
          this.router.navigate(['/gameverse/login']);
          throw new Error('Usuário não logado');
        }

        console.log('Buscando cliente completo para usuário ID:', usuario.id);
        return this.authService.getClienteCompleto();
      }),
      switchMap(cliente => {
        if (!cliente) {
          return throwError(() => new Error('Cliente não encontrado'));
        }

        return this.enderecoService.findByClienteId(cliente.id).pipe(
          map(enderecos => {
            cliente.listaEndereco = enderecos;
            return cliente;
          })
        );
      })
    ).subscribe({
      next: (cliente) => {
        /*if (!cliente.listaEndereco || cliente.listaEndereco.length === 0) {
          this.snackBar.open('Cadastre um endereço antes de finalizar a compra', 'Fechar', { duration: 5000, panelClass: ['custom-snackbar'] });
          this.router.navigate(['/gameverse/enderecos']);
          return;
        }*/

        this.router.navigate(['/gameverse/checkout']);
      },
      error: (error) => {
        console.error('Erro ao obter cliente:', error);
        this.snackBar.open('Erro ao carregar dados do cliente', 'Fechar', { duration: 5000, panelClass: ['custom-snackbar'] });
      }
    });
  }
}