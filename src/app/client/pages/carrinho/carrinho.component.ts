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
import { style } from '@angular/animations';
import { PedidoService } from '../../../core/services/order/pedido.service';
import { AuthService } from '../../../auth/auth.service';
import { Cliente } from '../../../core/models/cliente.model';
import { Pedido } from '../../../core/models/pedido.model';
import { map, switchMap, tap, throwError } from 'rxjs';
import { EnderecoService } from '../../../core/services/utils/endereco.service';
import { FreteOption } from '../../../core/models/frete-option.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FreteService } from '../../../core/services/order/frete.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

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
    NgxMaskPipe
  ],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.css'],
  providers: [provideNgxMask()]
})
export class CarrinhoComponent implements OnInit {
  carrinhoItens: ItemPedido[] = [];
  freteForm: FormGroup;
  opcoesFrete: FreteOption[] = [];
  freteSelecionado: FreteOption | null = null;
  calculandoFrete = false;
  erroFrete: string | null = null;

  constructor(
    private carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
    private enderecoService: EnderecoService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private freteService: FreteService,
    private fb: FormBuilder
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

  calcularFrete() {
    if (this.freteForm.invalid) {
      this.snackBar.open('Por favor, insira um CEP válido', 'Fechar', { duration: 3000 });
      return;
    }

    this.calculandoFrete = true;
    this.erroFrete = null;
    this.opcoesFrete = [];
    this.freteSelecionado = null;

    const cepDestino = this.freteForm.get('cepDestino')?.value.replace(/\D/g, '');

    console.log('Itens do carrinho:', this.carrinhoItens); // Verifique os itens
    console.log('CEP enviado:', cepDestino);

    this.freteService.calcularFreteParaCarrinho(this.carrinhoItens, cepDestino).subscribe({
      next: (resultado) => {
        this.opcoesFrete = resultado;
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
    this.carrinhoService.atualizarQuantidade(item.id, item.quantidade + 1);
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

  calcularTotal(): number {
    const totalProdutos = this.carrinhoService.getTotalValor();
    return totalProdutos + this.getValorFrete();
  }

  finalizarCompra(): void {
    if (!this.freteSelecionado) {
      this.snackBar.open('Por favor, selecione uma opção de frete', 'Fechar', { duration: 3000 });
      return;
    }
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