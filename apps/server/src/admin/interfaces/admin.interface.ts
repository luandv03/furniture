import { Role } from './role.enum';

export interface IAdmin {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: Role;
  access_token: string;
  refresh_token: string;
}

export interface IToken {
  access_token: string;
}
