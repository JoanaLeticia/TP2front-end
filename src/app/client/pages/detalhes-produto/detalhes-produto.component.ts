import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { Observable, switchMap } from 'rxjs';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { Produto } from '../../../core/models/produto.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ItemPedido } from '../../../core/models/item-pedido.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FreteService } from '../../../core/services/order/frete.service';
import { FreteOption } from '../../../core/models/frete-option.model';
import { CepService } from '../../../core/services/utils/cep.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-detalhes-produto',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeaderComponent, MatButtonModule, MatIconModule, MatProgressSpinnerModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe],
  templateUrl: './detalhes-produto.component.html',
  styleUrl: './detalhes-produto.component.css',
  providers: [provideNgxMask()]
})
export class DetalhesProdutoComponent implements OnInit {
  produto$!: Observable<Produto>;
  produto!: Produto; // Adicionado para armazenar o produto
  imageUrl: string | null = null;
  activeToggle: number | null = null;
  isLoading = true;
  freteForm: FormGroup;
  calculandoFrete = false;
  opcoesFrete: FreteOption[] = [];
  freteSelecionado: FreteOption | null = null;
  erroFrete: string | null = null;
  cepValido: boolean | null = null;
  cepCarregando = false;

  zoomTransform: string = '';
  zoomLevel: number = 2;
  isZooming: boolean = false;

  modalAberto: boolean = false;

  @ViewChild('productImage') productImage!: ElementRef<HTMLImageElement>;

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private router: Router,
    private fb: FormBuilder,
    private freteService: FreteService,
    private snackBar: MatSnackBar,
    private cepService: CepService,
    private titleService: Title
  ) {
    this.freteForm = this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]]
    });
  }

  ngOnInit(): void {
    this.produto$ = this.route.paramMap.pipe(
      switchMap(params => {
        const produtoId = Number(params.get('id'));
        return this.produtoService.findById(produtoId);
      })
    );

    this.produto$.subscribe({
      next: (produto) => {
        this.produto = produto;
        // Atualiza o título da página aqui
        this.titleService.setTitle(`${produto.nome} - ${produto.plataforma?.nome || 'N/A'} | Gameverse`);

        if (produto?.nomeImagem) {
          this.imageUrl = this.produtoService.getUrlImagem(produto.nomeImagem);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produto:', err);
        this.isLoading = false;
      }
    });
  }

  abrirModal() {
    if (this.imageUrl) {
      this.modalAberto = true;
      document.body.style.overflow = 'hidden';
    }
  }

  fecharModal() {
    this.modalAberto = false;
    document.body.style.overflow = '';
  }

  onCepChange() {
    const cepControl = this.freteForm.get('cep');
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

    const cep = this.freteForm.get('cep')?.value.replace(/\D/g, '');

    this.freteService.calcularFrete(this.produto.id, cep).subscribe({
      next: (resultado) => {
        this.opcoesFrete = resultado.filter(opcao => opcao.preco != null);
        this.calculandoFrete = false;
        if (this.opcoesFrete.length === 0) {
          this.erroFrete = 'Nenhuma opção de frete disponível para este CEP';
        }
      },
      error: (erro) => {
        console.error('Erro ao calcular frete:', erro);
        this.erroFrete = 'Erro ao calcular frete. Por favor, tente novamente.';
        this.calculandoFrete = false;
        this.snackBar.open(this.erroFrete, 'Fechar', {
          duration: 3000
        });
      }
    });
  }

  zoomImage(event: MouseEvent) {
    if (!this.imageUrl) return;

    this.isZooming = true;
    const img = this.productImage.nativeElement;
    const container = img.parentElement;

    if (!container) return;

    // Posição do mouse relativa à imagem
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Porcentagem da posição do mouse
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Aplica o zoom
    this.zoomTransform = `scale(${this.zoomLevel})`;
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
  }

  resetZoom() {
    this.isZooming = false;
    this.zoomTransform = 'scale(1)';
    if (this.productImage) {
      this.productImage.nativeElement.style.transformOrigin = 'center center';
    }
  }

  toggleSection(sectionId: number): void {
    this.activeToggle = this.activeToggle === sectionId ? null : sectionId;
  }

  adicionarAoCarrinho(produto: Produto): void {
    const item: ItemPedido = {
      id: produto.id,
      nome: produto.nome,
      valor: produto.preco,
      quantidade: 1,
      desenvolvedora: produto.desenvolvedora,
      plataforma: produto.plataforma?.nome || 'N/A',
      tipoMidia: produto.tipoMidia?.nome || 'N/A',
      nomeImagem: produto.nomeImagem,
      imagemUrl: produto.nomeImagem
        ? this.produtoService.getUrlImagem(produto.nomeImagem)
        : '../../../../assets/imagens/sem-imagem.jpg',
      produto: produto
    };

    this.carrinhoService.adicionarItem(item);

    this.router.navigate(['/gameverse/carrinho']);
  }

}