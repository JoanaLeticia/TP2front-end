import {Produto} from './produto.model';

export class ItemPedido {
    id!: number;
    valor!: number;
    quantidade!: number;
    nome!: string;
    desenvolvedora!: string;
    plataforma!: string;
    tipoMidia!: string;
    nomeImagem!: string;
    imagemUrl?: string;
}