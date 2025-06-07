import { Routes } from '@angular/router';
import { resolverAdm } from './admin/pages/admin/resolver/admin-resolver.resolver';
import { ClienteListComponent } from './admin/pages/cliente/cliente-list/cliente-list.component';
import { ClienteFormComponent } from './admin/pages/cliente/cliente-form/cliente-form.component';
import { HomeComponent } from './client/pages/home/home.component';
import { EstadoFormComponent } from './admin/pages/estado/estado-form/estado-form.component';
import { EstadoListComponent } from './admin/pages/estado/estado-list/estado-list.component';
import { resolverEstado } from './admin/pages/estado/resolver/estado.resolver';
import { MunicipioListComponent } from './admin/pages/municipio/municipio-list/municipio-list.component';
import { MunicipioFormComponent } from './admin/pages/municipio/municipio-form/municipio-form.component';
import { resolverMunicipio } from './admin/pages/municipio/resolver/municipio-resolver.resolver';
import { AdminListComponent } from './admin/pages/admin/admin-list/admin-list.component';
import { AdminFormComponent } from './admin/pages/admin/admin-form/admin-form.component';
import { ProdutoListComponent } from './admin/pages/produto/produto-list/produto-list.component';
import { ProdutoFormComponent } from './admin/pages/produto/produto-form/produto-form.component';
import { resolverProduto } from './admin/pages/produto/resolver/produto-resolver.resolver';
import { resolverCliente } from './admin/pages/cliente/resolver/cliente-resolver.resolver';
import { LoginComponent } from './client/pages/login/login.component';
import { CadastroComponent } from './client/pages/cadastro/cadastro.component';
import { DetalhesProdutoComponent } from './client/pages/detalhes-produto/detalhes-produto.component';
import { CarrinhoComponent } from './client/pages/carrinho/carrinho.component';
import { PlataformaComponent } from './client/pages/plataforma/plataforma.component';

export const routes: Routes = [

    // ADMIN
    { path: 'adm/list', component: AdminListComponent, title: 'Administradores' },
    { path: 'adm/form', component: AdminFormComponent, title: 'Cadastro de Administradores' },
    { path: 'adm/edit/:id', component: AdminFormComponent, resolve: { administrador: resolverAdm } },

    // ESTADO
    { path: 'estado/list', component: EstadoListComponent, title: 'Estados' },
    { path: 'estado/form', component: EstadoFormComponent, title: 'Cadastro de Estados' },
    { path: 'estado/edit/:id', component: EstadoFormComponent, resolve: { estado: resolverEstado } },

    // MUNICIPIO
    { path: 'municipio/list', component: MunicipioListComponent, title: 'Municipios' },
    { path: 'municipio/form', component: MunicipioFormComponent, title: 'Cadastro de Municipios' },
    { path: 'municipio/edit/:id', component: MunicipioFormComponent, resolve: { municipio: resolverMunicipio } },

    // CLIENTE
    { path: 'cliente/list', component: ClienteListComponent, title: 'Clientes' },
    { path: 'cliente/form', component: ClienteFormComponent, title: 'Cadastro de Cliente' },
    { path: 'cliente/edit/:id', component: ClienteFormComponent, resolve: { cliente: resolverCliente } },

    // PRODUTO
    { path: 'produtos/list', component: ProdutoListComponent, title: 'Produtos' },
    { path: 'produtos/form', component: ProdutoFormComponent, title: 'Cadastro de produto' },
    { path: 'produtos/edit/:id', component: ProdutoFormComponent, resolve: { produto: resolverProduto } },

    // HOME
    { path: 'gameverse/home', component: HomeComponent, title: 'Gameverse | Home' },

    // LOGIN CLIENTE
    { path: 'gameverse/login', component: LoginComponent, title: 'Gameverse | Login' },

    // CADASTRO CLIENTE
    { path: 'gameverse/cadastro', component: CadastroComponent, title: 'Gameverse | Cadastro' },

    // PRODUTO

    {
        path: 'gameverse/produto/plataforma/:nome', component: PlataformaComponent, title: 'Produtos por plataforma'
    },

    { path: 'gamerverse/produto/:id', component: DetalhesProdutoComponent, title: 'Detalhes da Produto' },

    { path: 'gameverse/carrinho', component: CarrinhoComponent, title: 'Carrinho' }

];