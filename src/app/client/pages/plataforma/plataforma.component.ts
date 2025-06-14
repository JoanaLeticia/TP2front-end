import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { Produto } from '../../../core/models/produto.model';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { GridProdutosComponent } from '../grid-produtos/grid-produtos.component';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  imports: [FooterComponent, HeaderComponent, GridProdutosComponent, CommonModule, MatPaginatorModule, MatFormFieldModule, MatOptionModule, MatSelectModule],
  providers: [
    {
      provide: MatPaginatorIntl,
      useValue: getPortuguesePaginatorIntl() // Use a função definida acima
    }
  ]
})
export class PlataformaComponent implements OnInit {
  produtos: Produto[] = [];
  plataforma = '';
  ordenacao = 'id,asc';
  dropdownOpen = false;

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
      this.buscarProdutos();
    });

    document.addEventListener('click', this.closeDropdownOnClickOutside.bind(this));
  }

  closeDropdownOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.dropdownOpen = false;
    }
  }

  // Não esqueça de remover o listener no ngOnDestroy
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
    this.ngOnInit();
  }

  buscarProdutos() {
    const [campo, direcao] = this.ordenacao.split(',');

    this.produtoService.getByPlataformaPaginado(this.plataforma, this.page, this.size, `${campo} ${direcao}`).subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        console.log('Dados recebidos:', {
          page: this.page,
          size: this.size,
          produtos: this.produtos.length
        });
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
      }
    });

    this.produtoService.countByPlataforma(this.plataforma).subscribe(
      data => {
        this.totalRecords = data;
      }
    )
  }
}
