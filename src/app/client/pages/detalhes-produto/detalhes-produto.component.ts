import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { Observable } from 'rxjs';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { Produto } from '../../../core/models/produto.model';



@Component({
  selector: 'app-detalhes-produto',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeaderComponent],
  templateUrl: './detalhes-produto.component.html',
  styleUrl: './detalhes-produto.component.css'
})
export class DetalhesProdutoComponent implements OnInit {
  isToggle: any;

  produto$!: Observable<Produto>;
  imageUrl: string | undefined;
  constructor(private route: ActivatedRoute,
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,) { }

  ngOnInit(): void {
    const produtoIdParam = this.route.snapshot.paramMap.get('id');
    if (produtoIdParam !== null) {
      const produtoId = parseInt(produtoIdParam, 10);
      this.produto$ = this.produtoService.findById(produtoId);
      console.error(produtoId);
    } else {
      console.error('ID do produto é nulo.');
    }
    console.log(this.produto$);
    this.carregarImagem();
  }

  carregarImagem() {
    this.produto$.subscribe(produto => {
      if (produto && produto.imagem) {
        this.imageUrl = this.produtoService.getUrlImagem(produto.imagem);
      }
    });
  }


  adicionarAoCarrinho(produto: Produto) {
    this.carrinhoService.adicionar({
      id: produto.id,
      nome: produto.nome,
      valor: produto.preco,
      quantidade: 1
    });
    console.log("Adicionou ao carrinho");
  }




}