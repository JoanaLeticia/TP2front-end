import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { inject } from "@angular/core";
import { Estado } from "../../../../core/models/estado.model";
import { EstadoService } from "../../../../core/services/utils/estado.service";

export const resolverEstado: ResolveFn<Estado> =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const id = Number(route.paramMap.get('id'));
    return inject(EstadoService).findById(id);
  }