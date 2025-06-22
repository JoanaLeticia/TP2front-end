import { Usuario } from "./usuario.model";

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}