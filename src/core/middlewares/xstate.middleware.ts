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
}

export function xstate<M extends AnyActorLogic>(
  actorLogic: M,
  actorOptions?: ActorOptions<M>,
) {
  return () => {
    const actorRef = shallowRef(createActor(actorLogic, actorOptions));
    const snapshotRef = shallowRef<SnapshotFrom<M>>(
      actorRef.value.getSnapshot(),
    );
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

    return {
      state: snapshotRef,
      actor: actorRef,
      $reset,
    } as Store<M>;
  };
}
