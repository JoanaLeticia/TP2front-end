import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarrinhoService } from '../../../../core/services/order/carrinho.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isListVisible = false;
  constructor(
    private carrinhoService: CarrinhoService,
    private router: Router) { }

  toggleList() {
    this.isListVisible = !this.isListVisible;
  }

  quantCarrinho(): number {
    return this.carrinhoService.tamanho();
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
}