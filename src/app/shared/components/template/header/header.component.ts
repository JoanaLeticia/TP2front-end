import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarrinhoService } from '../../../../core/services/order/carrinho.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../../../auth/auth.service';
import { Usuario } from '../../../../core/models/usuario.model';
import { Observable } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isListVisible = false;
  usuarioLogado$: Observable<Usuario | null>;
  searchControl = new FormControl('');
  showDropdown = false;

  constructor(
    private carrinhoService: CarrinhoService,
    private router: Router,
    private authService: AuthService
  ) {
    this.usuarioLogado$ = this.authService.getUsuarioLogado();
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
}