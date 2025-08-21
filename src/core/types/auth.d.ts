export interface Credentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}
