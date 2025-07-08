import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { FreteOption } from '../../models/frete-option.model';
import { ItemPedido } from '../../models/item-pedido.model';
import { ProdutoService } from '../product/produto.service';
import { Produto } from '../../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class FreteService {
  private apiUrl = 'http://localhost:8080/frete';

  constructor(private http: HttpClient) { }

  calcularFrete(produtoId: number, cepDestino: string): Observable<FreteOption[]> {
    const payload = {
      produtoId: produtoId,
      cepDestino: cepDestino
    };
    return this.http.post<FreteOption[]>(`${this.apiUrl}/calcular`, payload);
  }

  calcularFreteParaCarrinho(itens: ItemPedido[], cepDestino: string) {
    const url = `${this.apiUrl}/calcularcarrinho`;
    
    const itensParaBackend = itens.map(item => ({
      idProduto: item.id,
      quantidade: item.quantidade
    }));

    const body = {
      itens: itensParaBackend,
      cepDestino: cepDestino.replace(/\D/g, '')
    };
    return this.http.post<FreteOption[]>(url, body).pipe(
        catchError((erro: HttpErrorResponse) => {
            console.error('Erro na API de frete:', erro);
            let mensagem = erro.error?.message || 'Erro ao calcular frete. Tente novamente.';
            return throwError(() => new Error(mensagem));
        })
    );
  }

  private mapearRespostaFrete(response: any[]): FreteOption[] {
    if (!response || !Array.isArray(response)) {
      return [];
    }

    return response.map(item => ({
      nomeServico: item.name || item.nomeServico || 'Serviço não especificado',
      nomeTransportadora: item.company?.name || item.nomeTransportadora || 'Transportadora não especificada',
      preco: item.price?.toString() || item.preco?.toString() || '0',
      prazoEntrega: item.delivery_time?.toString() || item.prazoEntrega?.toString() || '0'
    })).filter(opcao =>
      opcao.nomeServico && opcao.nomeTransportadora && opcao.preco && opcao.prazoEntrega
    );
  }
}