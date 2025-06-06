import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Cliente } from "../../../../core/models/cliente.model";
import { inject } from "@angular/core";
import { ClienteService } from "../../../../core/services/user/cliente.service";

export const resolverCliente: ResolveFn<Cliente> =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const id = Number(route.paramMap.get('id'));
    return inject(ClienteService).findById(id);
  }