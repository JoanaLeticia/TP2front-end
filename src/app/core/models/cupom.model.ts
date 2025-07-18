export interface Cupom {
  id?: number;
  codigo: string;
  descricao?: string;
  tipo: {
    id?: number;
    nome: 'Valor Fixo' | 'Percentual';
  };
  valor?: number;
  percentual?: number;
  dataValidade?: string;
  ativo?: boolean;
}

export interface CupomValido {
  valido: boolean;
  cupom?: Cupom;
  mensagem?: string;
  valorDesconto?: number;
}