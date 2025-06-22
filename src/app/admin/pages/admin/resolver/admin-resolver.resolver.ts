import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { inject } from "@angular/core";
import { AdminService } from "../../../../core/services/user/admin.service";
import { Admin } from "../../../../core/models/admin.model";

export const resolverAdm: ResolveFn<Admin> =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const id = Number(route.paramMap.get('id'));
    return inject(AdminService).findById(id);
  }