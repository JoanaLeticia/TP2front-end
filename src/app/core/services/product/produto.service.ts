import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Produto } from "../../models/produto.model";
import { Observable } from 'rxjs';
import { Plataforma } from "../../models/plataforma.model";
import { TipoMidia } from "../../models/tipo-midia.model";
import { Genero } from "../../models/genero.model";
import { Classificacao } from "../../models/classificacao.model";
import { map } from 'rxjs/operators';

interface ProdutoSimplificado {
  id?: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  desenvolvedora: string;
  idPlataforma?: number;
  idTipoMidia?: number;
  idGenero?: number;
  idClassificacao?: number;
  dataLancamento: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private baseUrl = 'http://localhost:8080/produtos';
  http: any;

  constructor(private httpClient: HttpClient) { }

  getAllPaginacao(page: number, size: number): Observable<Produto[]> {
    const params = {
      page: page.toString(),
      size: size.toString()
    }
    return this.httpClient.get<Produto[]>(`${this.baseUrl}`, { params });
  }

  findAll(page?: number, size?: number): Observable<Produto[]> {
    let params: any = {};

    if (page !== undefined && size !== undefined) {
      params = {
        page: page.toString(),
        size: size.toString()
      }
    }

    return this.httpClient.get<{ dados: Produto[] }>(this.baseUrl, { params }).pipe(
      map(response => response.dados)
    );
  }


  findByNome(nome: string, page?: number, size?: number, sort?: string): Observable<Produto[]> {
    let params: any = {};

    if (page !== undefined && size !== undefined) {
      params = {
        page: page.toString(),
        size: size.toString()
      }
    }

    if (sort) {
      params.sort = sort;
    }

    console.log(this.baseUrl);
    console.log({ params });

    return this.httpClient.get<Produto[]>(`${this.baseUrl}/search/nome/${nome}`, { params });
  }

  findById(id: number): Observable<Produto> {
  return this.httpClient.get<Produto>(`${this.baseUrl}/${id}`).pipe(
    map(produto => ({
      ...produto,
      peso: produto.peso || 0.1,
      altura: produto.altura || 2,
      largura: produto.largura || 15,
      comprimento: produto.comprimento || 18
    }))
  );
}

  insert(produto: Produto | ProdutoSimplificado): Observable<Produto> {
    return this.httpClient.post<Produto>(this.baseUrl, produto);
  }

  update(produto: Produto | ProdutoSimplificado): Observable<Produto> {
    return this.httpClient.put<Produto>(`${this.baseUrl}/${produto.id}`, produto);
  }

  delete(produto: Produto): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${produto.id}`);
  }

  getUrlImagem(nomeImagem: string): string {
    return `${this.baseUrl}/image/download/${nomeImagem}`;
  }

  uploadImagem(id: number, nomeImagem: string, imagem: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('id', id.toString());
    formData.append('nomeImagem', imagem.name);
    formData.append('imagem', imagem, imagem.name);

    return this.httpClient.patch<Produto>(`${this.baseUrl}/image/upload`, formData);
  }

  findPlataformas(): Observable<Plataforma[]> {
    return this.httpClient.get<Plataforma[]>(`${this.baseUrl}/plataformas`);
  }

  findTiposMidia(): Observable<TipoMidia[]> {
    return this.httpClient.get<TipoMidia[]>(`${this.baseUrl}/tiposMidia`);
  }

  findGeneros(): Observable<Genero[]> {
    return this.httpClient.get<Genero[]>(`${this.baseUrl}/generos`);
  }

  findClassificacoes(): Observable<Classificacao[]> {
    return this.httpClient.get<Classificacao[]>(`${this.baseUrl}/classificacoes`);
  }

  /*getByPlataformaPaginado(nomePlataforma: string, page?: number, size?: number, sort?: string): Observable<Produto[]> {
    let params: any = {};

    if (page !== undefined && size !== undefined) {
      params = {
        page: page.toString(),
        size: size.toString()
      }
    }

    if (sort) {
      params.sort = sort;
    }

    console.log(this.baseUrl);
    console.log({ params });

    return this.httpClient.get<Produto[]>(
      `${this.baseUrl}/plataforma/${nomePlataforma}`, { params });
  }*/

  getByPlataforma(nomePlataforma: string): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(`${this.baseUrl}/plataforma/${nomePlataforma}`);
  }

  countByPlataforma(nomePlataforma: string, filtros: any): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/plataforma/${nomePlataforma}/count`, { params: filtros });
  }

  countByNome(nome: string): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/nome/${nome}/count`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  getFiltrosPorPlataforma(nomePlataforma: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}/filtros/${nomePlataforma}`);
  }

  getByPlataformaPaginado(nomePlataforma: string, params: any): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(`${this.baseUrl}/plataforma/${nomePlataforma}`, { params });
  }
}
