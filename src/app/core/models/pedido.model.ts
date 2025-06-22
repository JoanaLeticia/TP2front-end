import { Endereco } from "./endereco.model";
import { Cliente } from "./cliente.model";
import { ItemPedido } from "./item-pedido.model";
import { Pagamento } from "./pagamento.model";
import { StatusPedido } from "./status-pedido.model";

export class Pedido {
    idPedido!: number;
    cliente!: Cliente;
    enderecoEntrega!: Endereco;
    valorTotal!: number;
    itens: ItemPedido[] = [];
    pagamento!: Pagamento;
    horario?: string;
    statusPedido?: StatusPedido;
}