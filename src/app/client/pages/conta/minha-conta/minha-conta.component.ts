// minha-conta.component.ts
import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../../../shared/components/template/footer/footer.component";
import { HeaderComponent } from '../../../../shared/components/template/header/header.component';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../../auth/auth.service';
import { ClienteService } from '../../../../core/services/user/cliente.service';
import { EnderecoService } from '../../../../core/services/utils/endereco.service';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../../../core/models/cliente.model';
import { Endereco } from '../../../../core/models/endereco.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-minha-conta',
  imports: [FooterComponent, HeaderComponent, MatIcon, MatCardModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './minha-conta.component.html',
  styleUrl: './minha-conta.component.css',
  standalone: true
})
export class MinhaContaComponent implements OnInit {
  cliente: Cliente | null = null;
  enderecos: Endereco[] = [];
  primeiroEndereco: Endereco | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private enderecoService: EnderecoService,
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
          this.carregarEnderecos(cliente.id);
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

  carregarEnderecos(clienteId: number): void {
    this.enderecoService.findByClienteId(clienteId).subscribe({
      next: (enderecos) => {
        this.enderecos = enderecos;
        if (enderecos.length > 0) {
          this.primeiroEndereco = enderecos[0];
          // Remove o primeiro endereço da lista para não duplicar
          this.enderecos = enderecos.slice(1);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar endereços.';
        this.loading = false;
        console.error('Erro ao carregar endereços:', err);
      }
    });
  }

  getIniciais(): string {
    if (!this.cliente?.nome) return 'US';

    const nomes = this.cliente.nome.split(' ');
    let iniciais = '';

    // Pega a primeira letra do primeiro nome
    if (nomes.length > 0) {
      iniciais += nomes[0][0].toUpperCase();
    }

    // Pega a primeira letra do último nome (se existir)
    if (nomes.length > 1) {
      iniciais += nomes[nomes.length - 1][0].toUpperCase();
    }

    return iniciais || 'US';
  }

  formatarData(data: string | undefined): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  formatarCPF(cpf: string | undefined): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  logout(): void {
    this.authService.removeToken();
    this.authService.removeUsuarioLogado();
    window.location.href = 'gameverse/login';
  }

  formatarTelefones(): string {
    if (!this.cliente?.listaTelefone || this.cliente.listaTelefone.length === 0) {
      return 'Não informado';
    }

    return this.cliente.listaTelefone
      .map(tel => `(${tel.codArea}) ${tel.numero}`)
      .join(', ');
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }

  navegarParaEditarEndereco(enderecoId?: number): void {
    if (enderecoId) {
      this.router.navigate(['/gameverse/conta/editar-endereco', enderecoId]);
    } else {
      this.router.navigate(['/gameverse/conta/editar-endereco']);
    }
  }
}