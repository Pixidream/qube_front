import { ErrorResponse, SuccessResponse } from '@/core/types/response';
import { Credentials, LoginResponse } from '@core/types/auth';
import { ShallowRef } from 'vue';

export interface AuthenticationRepository {
  login: (
    credentials: Credentials,
  ) => Promise<{
    data: ShallowRef<SuccessResponse<LoginResponse> | ErrorResponse | null>;
    error: ShallowRef<any>;
  }>;
}
