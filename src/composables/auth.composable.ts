import { inject } from 'vue';
import { type AuthenticationRepository } from '@/core/repositories/auth/auth.repository';
import { createAuthService } from '@/core/services/auth.service';
import { logger } from '@/utils/logger';

const authComposableLogger = logger.child({ composable: 'auth' });

export const useAuthService = () => {
  authComposableLogger.debug('Attempting to inject authentication repository', {
    action: 'repository_injection',
  });

  const repository = inject<AuthenticationRepository>('authRepository');

  if (!repository) {
    authComposableLogger.error(
      'No authentication repository provided in dependency injection',
      undefined,
      {
        action: 'repository_injection_failed',
      },
    );
    throw new Error('no repository provided');
  }

  authComposableLogger.info('Authentication repository injected successfully', {
    action: 'repository_injection_success',
    repositoryType: repository.constructor.name,
  });

  authComposableLogger.debug('Creating authentication service instance', {
    action: 'service_creation',
  });

  const service = createAuthService(repository);

  authComposableLogger.debug('Authentication service created successfully', {
    action: 'service_creation_success',
  });

  return service;
};
