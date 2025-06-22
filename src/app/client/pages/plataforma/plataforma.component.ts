import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { Produto } from '../../../core/models/produto.model';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { GridProdutosComponent } from '../grid-produtos/grid-produtos.component';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

export function getPortuguesePaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Itens por página:';
  paginatorIntl.nextPageLabel = 'Próxima página';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.firstPageLabel = 'Primeira página';
  paginatorIntl.lastPageLabel = 'Última página';
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };

  return paginatorIntl;
}

@Component({
  selector: 'app-plataforma',
  standalone: true,
  templateUrl: './plataforma.component.html',
  styleUrl: './plataforma.component.css',
  imports: [FooterComponent, HeaderComponent, GridProdutosComponent, CommonModule, MatPaginatorModule, MatFormFieldModule, MatOptionModule, MatSelectModule, FormsModule, MatIcon],
  providers: [
    {
      provide: MatPaginatorIntl,
      useValue: getPortuguesePaginatorIntl()
    }
  ]
})
export class PlataformaComponent implements OnInit {
  produtos: Produto[] = [];
  plataforma = '';
  ordenacao = 'id,asc';
  dropdownOpen = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  nenhumProdutoEncontrado: boolean = false;

  plataformaNomes: { [key: string]: string } = {
    'ps4': 'PlayStation 4',
    'ps5': 'PlayStation 5',
    'xboxone': 'Xbox One',
    'xboxseries': 'Xbox Series X/S',
    'nintendo': 'Nintendo Switch',
  };

  filtros: any = {};
  filtrosSelecionados: any = {
    genero: [],
    desenvolvedora: [],
    faixasPreco: []
  };

  filterOptions = [
    { value: 'id,asc', label: 'Padrão' },
    { value: 'nome,asc', label: 'Nome (A-Z)' },
    { value: 'nome,desc', label: 'Nome (Z-A)' },
    { value: 'preco,asc', label: 'Menor Preço' },
    { value: 'preco,desc', label: 'Maior Preço' },
  ];

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectOption(value: string): void {
    this.ordenacao = value;
    this.dropdownOpen = false;
    this.aplicarOrdenacao();
  }

  getSelectedOptionText(): string {
    const selected = this.filterOptions.find(opt => opt.value === this.ordenacao);
    return selected ? selected.label : 'Selecione...';
  }

  // variaveis de controle para a paginacao
  totalRecords = 0;
  size = 8;
  page = 0;

  constructor(private route: ActivatedRoute, private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.plataforma = params.get('nome') || '';
      console.log('Plataforma recebida:', this.plataforma); // Adicione esta linha
      this.resetarPaginacao();
      this.buscarProdutos();
      this.carregarFiltros();
    });

    document.addEventListener('click', this.closeDropdownOnClickOutside.bind(this));
  }

  closeDropdownOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.dropdownOpen = false;
    }
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdownOnClickOutside);
  }

  aplicarOrdenacao(): void {
    this.page = 0;
    this.buscarProdutos();
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    window.scrollTo(0, 0);
    this.buscarProdutos();
  }

  resetarPaginacao(): void {
    this.page = 0;
    this.size = 8;
    this.totalRecords = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = 8;
    }
  }

  selecionarGenero(genero: string) {
    if (this.filtrosSelecionados.genero === genero) {
      this.filtrosSelecionados.genero = null; // Desmarca se já estiver selecionado
    } else {
      this.filtrosSelecionados.genero = genero;
    }
    this.aplicarFiltros();
  }

  selecionarPreco(faixa: number) {
    if (this.filtrosSelecionados.precoMax === faixa) {
      this.filtrosSelecionados.precoMax = null; // Desmarca se já estiver selecionado
    } else {
      this.filtrosSelecionados.precoMax = faixa;
    }
    this.aplicarFiltros();
  }

  selecionarDesenvolvedora(dev: string | null) {
    if (this.filtrosSelecionados.desenvolvedora === dev) {
      this.filtrosSelecionados.desenvolvedora = null;
    } else {
      this.filtrosSelecionados.desenvolvedora = dev;
    }
    this.aplicarFiltros();
  }

  buscarProdutos() {
    const [campo, direcao] = this.ordenacao.split(',');

    const params: {
      page: string;
      size: string;
      sort: string;
      genero?: string;
      desenvolvedora?: string;
      precoMax?: string;
    } = {
      page: this.page.toString(),
      size: this.size.toString(),
      sort: `${campo} ${direcao}`,
    };

    if (this.filtrosSelecionados.genero) {
      params.genero = this.filtrosSelecionados.genero;
    }

    if (this.filtrosSelecionados.desenvolvedora) {
      params.desenvolvedora = this.filtrosSelecionados.desenvolvedora;
    }

    if (this.filtrosSelecionados.precoMax) {
      params.precoMax = this.filtrosSelecionados.precoMax.toString();
    }

    console.log('Parâmetros enviados:', params);

    const countParams: any = {};

    if (this.filtrosSelecionados.genero) {
      countParams.genero = this.filtrosSelecionados.genero;
    }

    if (this.filtrosSelecionados.desenvolvedora) {
      countParams.desenvolvedora = this.filtrosSelecionados.desenvolvedora;
    }

    if (this.filtrosSelecionados.precoMax) {
      countParams.precoMax = this.filtrosSelecionados.precoMax;
    }

    this.produtoService.getByPlataformaPaginado(this.plataforma, params).subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.nenhumProdutoEncontrado = produtos.length === 0;
        console.log('Dados recebidos:', produtos);

        if (produtos.length > 0 || this.page === 0) {
          this.produtoService.countByPlataforma(this.plataforma, countParams).subscribe(
            data => {
              this.totalRecords = data;
              const totalPages = Math.ceil(this.totalRecords / this.size);

              // Corrige o loop infinito - só reseta se realmente necessário
              if (this.page > 0 && this.page >= totalPages) {
                this.resetarPaginacao();
                if (totalPages > 0) { // Só busca novamente se houver páginas
                  this.buscarProdutos();
                }
              }
            },
            error => {
              console.error('Erro ao contar produtos:', error);
            }
          );
        } else {
          this.totalRecords = 0;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.nenhumProdutoEncontrado = true;
      }
    });
  }

  carregarFiltros() {
    this.produtoService.getFiltrosPorPlataforma(this.plataforma).subscribe({
      next: (filtros) => {
        console.log('Filtros recebidos:', filtros);
        this.filtros = filtros;
      },
      error: (err) => console.error('Erro ao carregar filtros', err)
    });
  }

  aplicarFiltros() {
    this.page = 0;
    this.buscarProdutos();
  }

  limparFiltros() {
    this.filtrosSelecionados = {
      genero: null,
      desenvolvedora: null,
      faixasPreco: null
    };
    this.nenhumProdutoEncontrado = false;
    this.aplicarFiltros();
  }
}
