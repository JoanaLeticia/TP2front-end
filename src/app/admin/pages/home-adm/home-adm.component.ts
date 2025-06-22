import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { NavsideComponent } from "../../components/navside/navside.component";
import { Router } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { UsuarioService } from '../../../core/services/user/usuario.service';
import { PedidoService } from '../../../core/services/order/pedido.service';
import { count } from 'rxjs';

@Component({
  selector: 'app-home-adm',
  imports: [HeaderComponent, NavsideComponent],
  templateUrl: './home-adm.component.html',
  styleUrl: './home-adm.component.css'
})
export class HomeAdmComponent implements OnInit {
  totalProdutos: number = 0;
  totalPedidos: number = 0;
  totalUsuarios: number = 0;

  ngOnInit(): void { 
    this.carregarDados();
  }

  constructor(private router: Router,
    private produtoService: ProdutoService,
    private usuarioService: UsuarioService,
    private pedidoService: PedidoService
  ) {

  }

  irProdutos() {
    this.router.navigate(['/produtos/list']);
  }

  irClientes() {
    this.router.navigate(['/cliente/list']);
  }

  irAdmins() {
    this.router.navigate(['/adm/list']);
  }

  carregarDados(): void {
    this.produtoService.count().subscribe(count => {
      this.totalProdutos = count;
    });

    this.pedidoService.count().subscribe(count => {
      this.totalPedidos = count;
    });

    this.usuarioService.count().subscribe(count => {
      this.totalUsuarios = count;
    });
  }
}
