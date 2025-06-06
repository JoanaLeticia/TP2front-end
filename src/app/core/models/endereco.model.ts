import {Municipio} from './municipio.model';

export class Endereco {
    id!: number;
    logradouro!: string;
    numbero!: string;
    complemento!: string;
    bairro!: string;
    cep!: string;
    municipio!: Municipio
}