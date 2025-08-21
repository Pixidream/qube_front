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
