import { Maybe } from "graphql/jsutils/Maybe";
import { onMounted, onUnmounted, ref, Ref, watch } from "vue";
import { CRUDEvents } from "../..";
import { Model } from "../../Model";
import { ActionType } from "../../utils/ActionsTypes";
import { Subscription } from "../../utils/PushStream";
import { changeState, initialState } from "../StateUtils";

export const useSubscription = <TModel>(
  model: Ref<Model<TModel>>,
  eventTypes: CRUDEvents[]
) => {
  const state = initialState<TModel>();
  let subscription = ref<Maybe<Subscription>>();

  const subscribe = () => {
    subscription.value = model.value.subscribe((event) => {
      changeState({
        state,
        action: { type: ActionType.REQUEST_COMPLETE, data: event.data },
      });
    }, eventTypes);
  };
  const unsubscribe = () => {
    subscription.value?.unsubscribe();
  };

  watch(
    model,
    () => {
      unsubscribe();
      subscribe();
    },
    { deep: true, immediate: true }
  );

  onMounted(subscribe);
  onUnmounted(unsubscribe);
  return { state: state };
};
