/*O localStorage é comumente usado em aplicativos da web para armazenar preferências do usuário, 
tokens de autenticação, dados de configuração e outras informações que precisam ser mantidas entre 
sessões de navegação. Ele oferece uma maneira conveniente de persistir pequenos conjuntos de dados 
no navegador do usuário, sem a necessidade de usar cookies ou armazenar dados no lado do servidor. */

import { Injectable } from '@angular/core';

// O decorador @Injectable marca esta classe como um serviço que pode ser injetado em outros componentes e serviços do Angular.
// 'providedIn: 'root'' indica que este serviço é um singleton e está disponível em toda a aplicação.
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  // O método getItem recebe uma chave (key) como argumento, tenta obter o item correspondente do localStorage e retorna o valor.
  // Se o item existir, ele é convertido de uma string JSON para um objeto JavaScript.
  // Se o item não existir, retorna null.
  getItem(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  // O método setItem recebe uma chave (key) e um valor (value), converte o valor para uma string JSON e armazena-o no localStorage.
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // O método removeItem recebe uma chave (key) e remove o item correspondente do localStorage.
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

}