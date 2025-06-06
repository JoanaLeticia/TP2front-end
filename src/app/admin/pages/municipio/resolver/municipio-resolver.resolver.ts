import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { inject } from "@angular/core";
import { Municipio } from "../../../../core/models/municipio.model";
import { MunicipioService } from "../../../../core/services/utils/municipio.service";


export const resolverMunicipio: ResolveFn<Municipio> =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const id = Number(route.paramMap.get('id'));
        return inject(MunicipioService).findById(id);
    }