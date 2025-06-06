import { Endereco } from "./endereco.model";
import { Cliente } from "./cliente.model";
import { ItemPedido } from "./item-pedido.model";

export class Pedido {
    id!: number;
    cliente!: Cliente;
    endereco!: Endereco;
    valorTotal!: number;
    itemPedido: ItemPedido[] = [];
}