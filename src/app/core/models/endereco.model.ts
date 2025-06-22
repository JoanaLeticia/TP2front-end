import { Cliente } from './cliente.model';
import { Municipio } from './municipio.model';

export class Endereco {
    id?: number;
    logradouro!: string;
    numero!: string;
    complemento?: string;
    bairro!: string;
    cep!: string;
    municipio!: Municipio;  // precisa estar presente
    cliente?: Cliente;
}