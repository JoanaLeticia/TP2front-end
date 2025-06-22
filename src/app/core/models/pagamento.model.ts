import { MetodoPagamento } from "./metodo-pagamento.model";
import { StatusPagamento } from "./status-pagamento.model";

export class Pagamento {
    metodo!: MetodoPagamento;
    numeroCartao?: string;
    parcelas?: number;
    pedidoId!: number;
}

export interface PagamentoResponse {
    id: number;
    metodo: MetodoPagamento,
    dataPagamento: Date;
    codigoTransacao: string;
    status: StatusPagamento;
    pedidoId: number;
    numeroCartaoMascarado: string;
}