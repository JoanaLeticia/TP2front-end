import { Endereco } from "./endereco.model";
import { Telefone } from "./telefone.model";

export class Cliente {
    id!: number;
    nome!: string;
    login!: string;
    senha?: string;
    cpf!: string;
    dataNascimento!: string;
    listaTelefone: Telefone[] = [];
    listaEndereco: Endereco[] = [];
}