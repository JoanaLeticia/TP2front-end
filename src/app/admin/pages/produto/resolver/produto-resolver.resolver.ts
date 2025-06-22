import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { inject } from "@angular/core";
import { Produto } from "../../../../core/models/produto.model";
import { ProdutoService } from "../../../../core/services/product/produto.service";

export const resolverProduto: ResolveFn<Produto> =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const id = Number(route.paramMap.get('id'));
    return inject(ProdutoService).findById(id);
  }