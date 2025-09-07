import type { ShallowRef } from 'vue';

export interface SuccessResponse<T> {
  status: 'totp_verify' | 'success' | 'error' | 'email_verify';
  data: T;
}

export interface ErrorDetails {
  code: StatusCode;
  message: string;
  details?: string;
}

export interface ErrorResponse {
  status: 'totp_verify' | 'success' | 'error' | 'email_verify';
  error: ErrorDetails;
}

export interface ApiResponse<T> {
  data: ShallowRef<SuccessResponse<T> | null>;
  error: ShallowRef<any>;
  response: ShallowRef<Response | null>;
}
