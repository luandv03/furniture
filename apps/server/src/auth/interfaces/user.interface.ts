export interface IUser {
  user_id: string;
  email: string;
  name: string;
  access_token?: string;
  refresh_token?: string;
}
