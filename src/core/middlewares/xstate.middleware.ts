import { shallowRef } from 'vue';
import type {
  ActorOptions,
  ActorRefFrom,
  AnyActorLogic,
  SnapshotFrom,
} from 'xstate';
import { createActor } from 'xstate';
import { createServiceLogger } from '@/utils/logger';

const xstateLogger = createServiceLogger('XStateMiddleware');

export interface Store<M extends AnyActorLogic> {
  state: SnapshotFrom<M>;
  actor: ActorRefFrom<M>;
  $reset: () => void;
  $updateContext: (updater: (context: any) => any) => void;
}

export function xstate<M extends AnyActorLogic>(
  actorLogic: M,
  actorOptions?: ActorOptions<M> & { initialContext?: any },
) {
  return () => {
    const machineId = (actorLogic as any).id || 'unknown';

    xstateLogger.debug('Creating XState actor', {
      action: 'create_actor',
      machineId,
      hasOptions: !!actorOptions,
      hasInitialContext: !!actorOptions?.initialContext,
    });

    const actorRef = shallowRef(createActor(actorLogic, actorOptions));
    const snapshotRef = shallowRef<SnapshotFrom<M>>(
      actorRef.value.getSnapshot(),
    );

    // Apply initial context if provided
    if (actorOptions?.initialContext) {
      const snapshot = actorRef.value.getSnapshot();
      if ('context' in snapshot) {
        xstateLogger.debug('Applying initial context to machine', {
          action: 'apply_initial_context',
          machineId,
          contextKeys: Object.keys(actorOptions.initialContext),
        });
        Object.assign((snapshot as any).context, actorOptions.initialContext);
      }
    }

    actorRef.value.subscribe((nextState) => {
      const currentState = snapshotRef.value;
      snapshotRef.value = nextState;

      // Log state transitions
      if (currentState && 'value' in currentState && 'value' in nextState) {
        const currentStateValue = (currentState as any).value;
        const nextStateValue = (nextState as any).value;

        if (currentStateValue !== nextStateValue) {
          xstateLogger.debug('State machine transition', {
            action: 'state_transition',
            machineId,
            from: currentStateValue,
            to: nextStateValue,
          });
        }
      }
    });

    xstateLogger.info('Starting XState actor', {
      action: 'start_actor',
      machineId,
    });

    actorRef.value.start();

    const $reset = () => {
      xstateLogger.info('Resetting XState actor', {
        action: 'reset_actor',
        machineId,
      });

      actorRef.value.stop();
      const newActorRef = createActor(actorLogic, actorOptions);

      snapshotRef.value = newActorRef.getSnapshot();
      newActorRef.subscribe((nextState) => {
        const currentState = snapshotRef.value;
        snapshotRef.value = nextState;

        // Log state transitions for reset actor
        if (currentState && 'value' in currentState && 'value' in nextState) {
          const currentStateValue = (currentState as any).value;
          const nextStateValue = (nextState as any).value;

          if (currentStateValue !== nextStateValue) {
            xstateLogger.debug('State machine transition (reset actor)', {
              action: 'state_transition',
              machineId,
              from: currentStateValue,
              to: nextStateValue,
              context: 'reset',
            });
          }
        }
      });
      newActorRef.start();
      actorRef.value = newActorRef;

      xstateLogger.debug('XState actor reset complete', {
        action: 'reset_complete',
        machineId,
      });
    };

    const $updateContext = (updater: (context: any) => any) => {
      const snapshot = actorRef.value.getSnapshot();
      if ('context' in snapshot) {
        const currentContext = (snapshot as any).context;
        const newContext = updater(currentContext);
        Object.assign(currentContext, newContext);

        xstateLogger.debug('Updated machine context', {
          action: 'update_context',
          machineId,
          updatedKeys: Object.keys(newContext || {}),
          contextSize: Object.keys(currentContext).length,
        });
      } else {
        xstateLogger.warn(
          'Attempted to update context on machine without context',
          {
            action: 'update_context_failed',
            machineId,
            reason: 'no_context_in_snapshot',
          },
        );
      }
    };

    return {
      state: snapshotRef,
      actor: actorRef,
      $reset,
      $updateContext,
    } as Store<M>;
  };
}
