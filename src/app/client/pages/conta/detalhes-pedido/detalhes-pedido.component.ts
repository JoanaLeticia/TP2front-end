import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pedido } from '../../../../core/models/pedido.model';
import { AuthService } from '../../../../auth/auth.service';
import { Cliente } from '../../../../core/models/cliente.model';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../../shared/components/template/header/header.component';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-detalhes-pedido',
  standalone: true,
  imports: [CommonModule, MatIcon, FooterComponent, HeaderComponent, MatSpinner],
  templateUrl: './detalhes-pedido.component.html',
  styleUrls: ['./detalhes-pedido.component.css']
})
export class DetalhesPedidoComponent implements OnInit {
  pedido: Pedido | null = null;
  cliente: Cliente | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Componente - Iniciando carregamento...');

    this.route.data.subscribe({
      next: (data) => {
        console.log('Componente - Dados recebidos do resolver:', data);
        this.pedido = data['pedido'];
        console.log('Componente - Pedido atribuído:', this.pedido);
        this.loading = false;
        this.carregarDadosUsuario();
      },
      error: (err) => {
        console.error('Componente - Erro ao carregar dados:', err);
        this.error = 'Erro ao carregar detalhes do pedido';
        this.loading = false;
      }
    });
  }

  carregarDadosUsuario(): void {
    this.authService.getClienteCompleto().subscribe({
      next: (cliente) => {
        this.cliente = cliente;
      },
      error: (err) => {
        console.error('Erro ao carregar cliente:', err);
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

  voltarParaPedidos(): void {
    this.router.navigate(['/gameverse/conta/meus-pedidos']);
  }

  logout(): void {
    this.authService.removeToken();
    this.authService.removeUsuarioLogado();
    this.router.navigate(['/gameverse/login']);
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }
}