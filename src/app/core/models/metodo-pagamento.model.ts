export enum MetodoPagamento {
    CARTAO_CREDITO = 1,
    CARTAO_DEBITO = 2,
    PIX = 3,
    BOLETO = 4
}

export interface MetodoPagamentoModel {
    id: number;
    nome: string;
}