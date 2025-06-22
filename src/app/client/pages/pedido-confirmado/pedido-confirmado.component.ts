import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../../shared/components/template/footer/footer.component";
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../core/services/order/pedido.service';
import { AuthService } from '../../../auth/auth.service';
import { Pedido } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-pedido-confirmado',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './pedido-confirmado.component.html',
  styleUrls: ['./pedido-confirmado.component.css']
})
export class PedidoConfirmadoComponent implements OnInit {
  pedido: Pedido | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private pedidoService: PedidoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carregarUltimoPedido();
  }

  carregarUltimoPedido(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.pedidoService.findLastByUser().subscribe({
      next: (pedido: Pedido) => {
        this.pedido = pedido;
        console.log("pedido: ", pedido);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar último pedido:', err);
        this.errorMessage = 'Erro ao carregar os dados do pedido';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/gameverse/meus-pedidos']);
        }, 5000);
      }
    });
  }

  get emailUsuario(): string {
    const usuario = this.authService.getUsuariologadoSnapshot();
    return usuario?.email || '';
  }

  irParaMeusPedidos(): void {
    this.router.navigate(['/gameverse/conta/meus-pedidos']);
  }
}