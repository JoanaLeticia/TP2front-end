import { ExtraOptions, RouterModule, Routes } from '@angular/router';
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
import { LoginAdmComponent } from './admin/pages/login-adm/login-adm.component';
import { HomeAdmComponent } from './admin/pages/home-adm/home-adm.component';
import { PesquisaProdutosComponent } from './client/pages/pesquisa-produtos/pesquisa-produtos.component';
import { CheckoutComponent } from './client/pages/checkout/checkout.component';
import { CarrinhoResolver } from './client/pages/carrinho/carrinho-resolver.resolver';
import { NgModule } from '@angular/core';
import { PedidoConfirmadoComponent } from './client/pages/pedido-confirmado/pedido-confirmado.component';
import { MinhaContaComponent } from './client/pages/conta/minha-conta/minha-conta.component';
import { MeusPedidosComponent } from './client/pages/conta/meus-pedidos/meus-pedidos.component';
import { EditarInfosComponent } from './client/pages/conta/editar-infos/editar-infos.component';
import { EditarEnderecoComponent } from './client/pages/conta/editar-endereco/editar-endereco.component';
import { DetalhesPedidoComponent } from './client/pages/conta/detalhes-pedido/detalhes-pedido.component';
import { PedidoResolver } from './client/pages/conta/detalhes-pedido/pedido-resolver.resolver';
import { AdminGuard } from './auth/admin.guard';

export const routes: Routes = [

    // ADMIN
    { path: 'adm/list', component: AdminListComponent, title: 'Administradores', canActivate: [AdminGuard]},
    { path: 'adm/form', component: AdminFormComponent, title: 'Cadastro de Administradores', canActivate: [AdminGuard]},
    { path: 'adm/edit/:id', component: AdminFormComponent, resolve: { administrador: resolverAdm }, canActivate: [AdminGuard]},

    { path: 'adm/login', component: LoginAdmComponent, title: 'Admin | Login'},

    { path: 'adm/home', component: HomeAdmComponent, title: 'Admin | HOME', canActivate: [AdminGuard]},

    // ESTADO
    { path: 'estado/list', component: EstadoListComponent, title: 'Estados', canActivate: [AdminGuard]},
    { path: 'estado/form', component: EstadoFormComponent, title: 'Cadastro de Estados', canActivate: [AdminGuard]},
    { path: 'estado/edit/:id', component: EstadoFormComponent, resolve: { estado: resolverEstado }, canActivate: [AdminGuard]},

    // MUNICIPIO
    { path: 'municipio/list', component: MunicipioListComponent, title: 'Municipios', canActivate: [AdminGuard]},
    { path: 'municipio/form', component: MunicipioFormComponent, title: 'Cadastro de Municipios', canActivate: [AdminGuard]},
    { path: 'municipio/edit/:id', component: MunicipioFormComponent, resolve: { municipio: resolverMunicipio }, canActivate: [AdminGuard]},

    // CLIENTE
    { path: 'cliente/list', component: ClienteListComponent, title: 'Clientes', canActivate: [AdminGuard]},
    { path: 'cliente/form', component: ClienteFormComponent, title: 'Cadastro de Cliente', canActivate: [AdminGuard]},
    { path: 'cliente/edit/:id', component: ClienteFormComponent, resolve: { cliente: resolverCliente }, canActivate: [AdminGuard]},

    // PRODUTO
    { path: 'produtos/list', component: ProdutoListComponent, title: 'Produtos', canActivate: [AdminGuard]},
    { path: 'produtos/form', component: ProdutoFormComponent, title: 'Cadastro de produto',canActivate: [AdminGuard]},
    { path: 'produtos/edit/:id', component: ProdutoFormComponent, resolve: { produto: resolverProduto }, canActivate: [AdminGuard]},

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

    { path: 'gameverse/pesquisa', component: PesquisaProdutosComponent, title: 'Pesquisa de Produto' },

    { path: 'gameverse/produto/:id', component: DetalhesProdutoComponent, title: 'Detalhes da Produto' },

    { path: 'gameverse/carrinho', component: CarrinhoComponent, title: 'Carrinho' },
    { path: 'gameverse/checkout', component: CheckoutComponent, title: 'Checkout', resolve: { carrinhoItens: CarrinhoResolver } },
    { path: 'gameverse/pedidoconfirmado', component: PedidoConfirmadoComponent, title: 'Pedido Confirmado' },

    { path: 'gameverse/conta/minha-conta', component: MinhaContaComponent, title: 'Minha Conta' },
    { path: 'gameverse/conta/meus-pedidos', component: MeusPedidosComponent, title: 'Meus Pedidos' },
    {
        path: 'gameverse/conta/detalhes-pedido/:id', component: DetalhesPedidoComponent, title: 'Detalhe do Pedido', resolve: {
            pedido: PedidoResolver
        },
        data: {
            title: 'Detalhes do Pedido'
        }
    },
    { path: 'gameverse/conta/editar-info', component: EditarInfosComponent, title: 'Editar Informações' },
    { path: 'gameverse/conta/editar-endereco/:id', component: EditarEnderecoComponent, title: 'Editar Endereço' },
];