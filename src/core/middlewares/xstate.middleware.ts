import { shallowRef } from 'vue';
import type {
  ActorOptions,
  ActorRefFrom,
  AnyActorLogic,
  SnapshotFrom,
} from 'xstate';
import { createActor } from 'xstate';

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
    const actorRef = shallowRef(createActor(actorLogic, actorOptions));
    const snapshotRef = shallowRef<SnapshotFrom<M>>(
      actorRef.value.getSnapshot(),
    );

    // Apply initial context if provided
    if (actorOptions?.initialContext) {
      const snapshot = actorRef.value.getSnapshot();
      if ('context' in snapshot) {
        Object.assign((snapshot as any).context, actorOptions.initialContext);
      }
    }

    actorRef.value.subscribe((nextState) => {
      snapshotRef.value = nextState;
    });
    actorRef.value.start();

    const $reset = () => {
      actorRef.value.stop();
      const newActorRef = createActor(actorLogic, actorOptions);

      snapshotRef.value = newActorRef.getSnapshot();
      newActorRef.subscribe((nextState) => {
        snapshotRef.value = nextState;
      });
      newActorRef.start();
      actorRef.value = newActorRef;
    };

    const $updateContext = (updater: (context: any) => any) => {
      const snapshot = actorRef.value.getSnapshot();
      if ('context' in snapshot) {
        const currentContext = (snapshot as any).context;
        const newContext = updater(currentContext);
        Object.assign(currentContext, newContext);
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
