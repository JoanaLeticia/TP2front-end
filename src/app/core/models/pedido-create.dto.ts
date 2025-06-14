export interface PedidoCreateDTO {
  itens: {
    idProduto: number;
    quantidade: number;
  }[];
}