import { Routes } from '@angular/router';
import { EstadoListComponent } from './components/estado/estado-list/estado-list.component';
import { EstadoFormComponent } from './components/estado/estado-form/estado-form.component';
import { estadoResolver } from './components/estado/estado.resolver';
import { UserTemplateComponent } from './components/template/user-template/user-template.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guard/auth.guard';
import { AdminTemplateComponent } from './components/template/admin-template/admin-template.component';

export const routes: Routes = [
    {
        path: '',
        component: UserTemplateComponent,
        title: 'e-Commerce',
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'faixas' },
        ]
    },
    {
        path: 'admin',
        component: AdminTemplateComponent,
        title: 'Administrativo',
        canActivate: [authGuard],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'estados' },
            { path: 'login', component: LoginComponent, title: 'Login' },
            { path: 'estados', component: EstadoListComponent, title: 'Lista de Estados' },
            { path: 'estados/new', component: EstadoFormComponent, title: 'Novo Estado' },
            { path: 'estados/edit/:id', component: EstadoFormComponent,
              title: 'Edição de Estado', resolve: { estado: estadoResolver } }
        ]
    },
    {path: 'estados', component: EstadoListComponent, title: 'Lista de Estados'},
    {path: 'estados/new', component: EstadoFormComponent, title: 'Novo Estado'},
    {path: 'estados/edit/:id', component: EstadoFormComponent, 
        title: 'Edição de Estado', resolve: {estado: estadoResolver}},
];
