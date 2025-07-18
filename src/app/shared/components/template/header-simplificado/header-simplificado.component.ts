import { Component, HostListener, OnInit } from '@angular/core';
import { CarrinhoService } from '../../../../core/services/order/carrinho.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { ItemPedido } from '../../../../core/models/item-pedido.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../../../core/models/usuario.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-header-simplificado',
  imports: [CommonModule, RouterModule, MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './header-simplificado.component.html',
  styleUrl: './header-simplificado.component.css'
})
export class HeaderSimplificadoComponent implements OnInit {
  isListVisible = false;
  usuarioLogado$: Observable<Usuario | null>;
  searchControl = new FormControl('');
  showDropdown = false;
  showCartDropdown = false;
  carrinhoItens: ItemPedido[] = [];

  constructor(
    private carrinhoService: CarrinhoService,
    private router: Router,
    private authService: AuthService
  ) {
    this.usuarioLogado$ = this.authService.getUsuarioLogado();
    this.carrinhoService.carrinho$.subscribe(itens => {
      this.carrinhoItens = itens;
    });
  }

  ngOnInit(): void { }

  toggleList() {
    this.isListVisible = !this.isListVisible;
  }

  quantCarrinho(): number {
    return this.carrinhoService.getTotalItens();
  }

  onLoginClick(): void {
    this.router.navigate(['/gameverse/login']);
  }

  onCadastroClick(): void {
    this.router.navigate(['/gameverse/cadastro']);
  }

  onCarrinhoClick(): void {
    this.router.navigate(['/gameverse/carrinho']);
  }

  totalCarrinho(): number {
    return this.carrinhoItens.reduce((total, item) => total + (item.valor * item.quantidade), 0);
  }

  logout(): void {
    const usuario = this.authService.getUsuariologadoSnapshot();
    if (usuario?.perfil === 'CLIENTE') {
      this.carrinhoService.limparCarrinhoEspecifico(usuario.id.toString());
    }

    this.authService.logoutCompleto();

    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/adm')) {
      this.router.navigate(['/adm/login']);
    } else {
      this.router.navigate(['/gameverse/home']);
    }
  }

  pesquisarProdutos(): void {
    const termo = this.searchControl.value?.trim();
    if (termo) {
      this.router.navigate(['/gameverse/pesquisa'], { queryParams: { q: termo } });
    }
  }

  isForceShowing = false;
  isNavHidden = false;
  lastScrollPosition = 0;
  navHeight = 50;

  toggleNav() {
    this.isForceShowing = !this.isForceShowing;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (this.isForceShowing) {
      if (window.pageYOffset === 0) {
        this.isForceShowing = false;
        this.isNavHidden = false;
      }
      return;
    }

    const currentScrollPosition = window.pageYOffset;
    const showThreshold = 150; // 150px do topo
    const scrollDirection = currentScrollPosition > this.lastScrollPosition ? 'down' : 'up';

    // Esconde ao rolar para baixo após o threshold
    if (scrollDirection === 'down' && currentScrollPosition > showThreshold) {
      this.isNavHidden = true;
    }
    // Mostra apenas quando estiver a 150px do topo ao rolar para cima
    else if (scrollDirection === 'up' && currentScrollPosition <= showThreshold) {
      this.isNavHidden = false;
    }

    this.lastScrollPosition = currentScrollPosition;
  }
}
