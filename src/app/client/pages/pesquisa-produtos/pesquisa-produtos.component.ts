import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { Produto } from '../../../core/models/produto.model';
import { ActivatedRoute, Router } from '@angular/router';
import { GridProdutosComponent } from '../grid-produtos/grid-produtos.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FooterComponent } from "../../../shared/components/template/footer/footer.component";
import { HeaderComponent } from '../../../shared/components/template/header/header.component';

@Component({
  selector: 'app-pesquisa-produtos',
  standalone: true,
  imports: [CommonModule, GridProdutosComponent, MatPaginatorModule, MatProgressSpinnerModule, FooterComponent, HeaderComponent],
  templateUrl: './pesquisa-produtos.component.html',
  styleUrl: './pesquisa-produtos.component.css'
})
export class PesquisaProdutosComponent implements OnInit {
  produtos: Produto[] = [];
  termoPesquisa: string = '';
  ordenacao = 'id,asc';
  isLoading = false;
  dropdownOpen = false;

  filterOptions = [
    { value: 'id,asc', label: 'Padrão' },
    { value: 'nome,asc', label: 'Nome (A-Z)' },
    { value: 'nome,desc', label: 'Nome (Z-A)' },
    { value: 'preco,asc', label: 'Menor Preço' },
    { value: 'preco,desc', label: 'Maior Preço' },
  ];

  totalRecords = 0;
  size = 8;
  page = 0;

  constructor(
    private produtoService: ProdutoService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.termoPesquisa = params['q'] || '';
      if (this.termoPesquisa) {
        this.buscarProdutos();
      } else {
        this.router.navigate(['/gameverse/home']);
      }
    });

    document.addEventListener('click', this.closeDropdownOnClickOutside.bind(this));
  }

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

  closeDropdownOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.dropdownOpen = false;
    }
  }

  ngOnDestroy() {

  }

  aplicarOrdenacao(): void {
    this.page = 0;
    this.buscarProdutos();
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.buscarProdutos();
  }

  buscarProdutos() {
    const [campo, direcao] = this.ordenacao.split(',');

    this.isLoading = true;
    this.produtoService.findByNome(this.termoPesquisa, this.page, this.size, `${campo} ${direcao}`).subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.isLoading = false;
        console.log('Dados recebidos:', {
          page: this.page,
          size: this.size,
          produtos: this.produtos.length
        });
      },
      error: (err) => {
        console.error('Erro ao buscar produtos:', err);
        this.isLoading = false;
      }
    });

    this.produtoService.countByNome(this.termoPesquisa).subscribe(
      data => {
        this.totalRecords = data;
      }
    )
  }
}
