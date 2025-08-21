import { inject } from 'vue';
import { type AuthenticationRepository } from '@/core/repositories/auth/auth.repository';
import { createAuthService } from '@/core/services/auth.service';

export const useAuthService = () => {
  const repository = inject<AuthenticationRepository>('authRepository');

  if (!repository) {
    throw new Error('no repository provided');
  }

  const service = createAuthService(repository);

  return service;
};
