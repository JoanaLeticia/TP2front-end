import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Produto } from "../../models/produto.model";
import { Observable } from 'rxjs';
import { Plataforma } from "../../models/plataforma.model";
import { TipoMidia } from "../../models/tipo-midia.model";
import { Genero } from "../../models/genero.model";
import { ClassificacaoIndicativa } from "../../models/classificacao-indicativa.model";
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

  getAllPaginacao(pagina: number, tamanhoPagina: number): Observable<Produto[]> {
    const params = {
      page: pagina.toString(),
      pageSize: tamanhoPagina.toString()
    }
    return this.httpClient.get<Produto[]>(`${this.baseUrl}`, { params });
  }

  findAll(page?: number, pageSize?: number): Observable<Produto[]> {
    let params = {};

    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      }
    }

    return this.httpClient.get<{ dados: Produto[] }>(this.baseUrl, { params }).pipe(
      map(response => response.dados)
    );
  }

  findByNome(nome: string): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(`${this.baseUrl}/search/nome/${nome}`);
  }

  findById(id: number): Observable<Produto> {
    return this.httpClient.get<Produto>(`${this.baseUrl}/${id}`);
  }

  insert(produto: Produto): Observable<Produto> {
    const obj = {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      estoque: produto.estoque,
      desenvolvedora: produto.desenvolvedora,
      plataforma: produto.plataforma.id,
      tipoMidia: produto.tipoMidia.id,
      genero: produto.genero.id,
      classificacaoIndicativa: produto.classificacaoIndicativa.id,
      nomeImagem: produto.nomeImagem
    }

    return this.httpClient.post<Produto>(this.baseUrl, obj);
  }

  update(produto: Produto): Observable<Produto> {
    const obj = {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      estoque: produto.estoque,
      desenvolvedora: produto.desenvolvedora,
      plataforma: produto.plataforma.id,
      tipoMidia: produto.tipoMidia.id,
      genero: produto.genero.id,
      classificacaoIndicativa: produto.classificacaoIndicativa.id,
      nomeImagem: produto.nomeImagem
    }
    return this.httpClient.put<Produto>(`${this.baseUrl}/${obj.id}`, obj);
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

  findClassificacoes(): Observable<ClassificacaoIndicativa[]> {
    return this.httpClient.get<ClassificacaoIndicativa[]>(`${this.baseUrl}/classificacoes`);
  }

  getByPlataformaPaginado(nomePlataforma: string, page?: number, size?: number): Observable<Produto[]> {
    let params = {};

    if (page !== undefined && size !== undefined) {
      params = {
        page: page.toString(),
        page_size: size.toString()
      }
    }

    console.log(this.baseUrl);
    console.log({ params });
    return this.httpClient.get<Produto[]>(
      `${this.baseUrl}/plataforma/${nomePlataforma}`, { params });
  }

  getByPlataforma(nomePlataforma: string): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(`${this.baseUrl}/plataforma/${nomePlataforma}`);
  }

  countByPlataforma(nomePlataforma: string): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/plataforma/${nomePlataforma}/count`);
  }

}
