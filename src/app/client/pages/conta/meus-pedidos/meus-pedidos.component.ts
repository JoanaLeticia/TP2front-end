import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../../shared/components/template/header/header.component';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../auth/auth.service';
import { ClienteService } from '../../../../core/services/user/cliente.service';
import { Router } from '@angular/router';
import { Cliente } from '../../../../core/models/cliente.model';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../../core/services/order/pedido.service';
import { Pedido } from '../../../../core/models/pedido.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-meus-pedidos',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, MatSpinner, MatIcon, CommonModule, MatButtonModule],
  templateUrl: './meus-pedidos.component.html',
  styleUrl: './meus-pedidos.component.css'
})
export class MeusPedidosComponent implements OnInit {
  cliente: Cliente | null = null;
  loading = true;
  error: string | null = null;
  pedidos: Pedido[] = [];

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private pedidoService: PedidoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarDadosUsuario();
  }

  carregarDadosUsuario(): void {
    this.authService.getClienteCompleto().subscribe({
      next: (cliente) => {
        if (cliente) {
          this.cliente = cliente;
          this.carregarPedidos(cliente.id);
        } else {
          this.error = 'Não foi possível carregar os dados do usuário.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Erro ao carregar dados do usuário.';
        this.loading = false;
        console.error('Erro ao carregar cliente:', err);
      }
    });
  }

  carregarPedidos(clienteId: number): void {
    this.pedidoService.findByClienteId(clienteId).subscribe({
      next: (pedidos) => {
        console.log('pedidos:', pedidos);
        this.pedidos = pedidos;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar pedidos.';
        this.loading = false;
        console.error('Erro ao carregar pedidos:', err);
      }
    });
  }

  getIniciais(): string {
    if (!this.cliente?.nome) return 'US';
    const nomes = this.cliente.nome.split(' ');
    let iniciais = '';
    if (nomes.length > 0) iniciais += nomes[0][0].toUpperCase();
    if (nomes.length > 1) iniciais += nomes[nomes.length - 1][0].toUpperCase();
    return iniciais || 'US';
  }

  formatarData(data: string | undefined): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  verDetalhes(pedidoId: number): void {
    this.router.navigate([`/gameverse/conta/detalhes-pedido/${pedidoId}`]);
  }

  logout(): void {
    this.authService.removeToken();
    this.authService.removeUsuarioLogado();
    window.location.href = 'gameverse/login';
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }
}