import { readonly } from "@vue/reactivity";
import { Maybe } from "graphql/jsutils/Maybe";
import { Ref, watch } from "vue";
import { Filter } from "../../filters";
import { Model } from "../../Model";
import { CRUDEvents, StoreChangeEvent } from "../../storage";
import { ActionType } from "../../utils/ActionsTypes";
import {
  changeState,
  IdSwap,
  initialState,
  ReactiveState,
} from "../StateUtils";

const onAdded = <TModel>(state: ReactiveState<TModel>, newData: TModel[]) => {
  const changedData = [...state.data, ...newData];
  return changedData;
};

const onChanged = <TModel>(
  state: ReactiveState<TModel>,
  newData: TModel[],
  primaryKeyName: string
) => {
  if (state.data.length == 0) return state.data;

  // What happens to data that get's updated and falls outside original query filter?
  const changedData = state.data.map((d) => {
    const dPrimaryKey = (d as Record<string, unknown>)[primaryKeyName];
    const index = newData.findIndex(
      (newD) =>
        (newD as Record<string, unknown>)[primaryKeyName] === dPrimaryKey
    );
    if (index === -1) {
      return d;
    }
    return newData[index];
  });
  return changedData;
};

const onIdSwapped = <TModel>(
  state: ReactiveState<TModel>,
  newData: IdSwap<TModel>[],
  primaryKeyName: string
) => {
  if (state.data.length == 0) return state.data;

  const changedData = state.data.map((d) => {
    const dPrimaryKey = (d as Record<string, unknown>)[primaryKeyName];
    const index = newData.findIndex(
      (newD) =>
        (newD.previous as Record<string, unknown>)[primaryKeyName] ===
        dPrimaryKey
    );
    if (index === -1) {
      return d;
    }
    return newData[index].current;
  });
  return changedData;
};

const onRemoved = <TModel>(
  state: ReactiveState<TModel>,
  removedData: TModel[],
  primaryKeyName: string
) => {
  if (state.data.length == 0) return state.data;
  const changedData = state.data.filter((d) => {
    const dPrimaryKey = (d as Record<string, unknown>)[primaryKeyName];
    return removedData.findIndex(
      (newD) =>
        (newD as Record<string, unknown>)[primaryKeyName] === dPrimaryKey
    );
  });
  return changedData;
};

export const updateResult = <TModel>(
  state: ReactiveState<TModel>,
  event: StoreChangeEvent,
  primaryKeyName: string
) => {
  const data = event.data;
  switch (event.eventType) {
    case CRUDEvents.ADD:
      return onAdded(state, data);
    case CRUDEvents.UPDATE:
      return onChanged(state, data, primaryKeyName);
    case CRUDEvents.ID_SWAP:
      return onIdSwapped(state, data, primaryKeyName);
    case CRUDEvents.DELETE:
      return onRemoved(state, data, primaryKeyName);
    default:
      throw new Error(`Invalid event ${event.eventType} received`);
  }
};

const createSubscribeToUpdates = <TModel>(
  state: ReactiveState<TModel>,
  model: Model<TModel>
) => {
  return (
    eventsToWatch?: CRUDEvents[],
    customEventHandler?: (
      state: ReactiveState<TModel>,
      // FIXME: investigate type
      data: Maybe<TModel | Maybe<TModel>[]>
    ) => Maybe<TModel | Maybe<TModel>[]>
  ) => {
    const subscription = model.subscribe((event) => {
      let newData;

      if (customEventHandler) {
        newData = customEventHandler(state, event.data);
      }
      const primaryKeyName = model.getSchema().getPrimaryKey();
      newData = updateResult(state, event, primaryKeyName);

      if (!subscription.closed) {
        // Important to check beacuse Componnent could be unmounted
        changeState({
          state,
          action: { type: ActionType.UPDATE_RESULT, data: newData },
        });
      }
    }, eventsToWatch);
    return subscription;
  };
};

interface QueryResults<TModel> extends UseQuery<TModel> {
  state: ReactiveState<TModel>;
}
const queryResults = async <TModel>({
  state,
  selector,
  model,
}: QueryResults<TModel>) => {
  if (state.loading) {
    return;
  }

  changeState({ state, action: { type: ActionType.INITIATE_REQUEST } });
  try {
    let results;
    const selectorValue = selector.value;
    if (typeof selectorValue === "string") {
      results = await model.value.queryById(selectorValue);
    } else {
      results = await model.value.query(selectorValue);
    }
    changeState({
      state,
      action: { type: ActionType.REQUEST_COMPLETE, data: results },
    });
  } catch (error) {
    changeState({
      state,
      action: { type: ActionType.REQUEST_COMPLETE, error },
    });
  }
};

interface UseQuery<TModel> {
  model: Ref<Model<TModel>>;
  selector: Ref<Filter<TModel> | string | undefined>;
}
const subscribeQueryToUpdates = <TModel>({
  state,
  model,
}: {
  state: ReactiveState<TModel>;
  model: Ref<Model<TModel>>;
}) => () => {
  watch(
    model,
    () => {
      createSubscribeToUpdates(state, model.value);
    },
    { deep: true, immediate: true }
  );
};

export const useQuery = <TModel>({ model, selector }: UseQuery<TModel>) => {
  const state = initialState<TModel>();
  const subscribeToUpdates = subscribeQueryToUpdates({ model, state });
  const runQuery = () =>
    queryResults({
      model,
      state,
      selector,
    });
  watch(selector, runQuery, { deep: true, immediate: true });
  watch(model, runQuery, { deep: true, immediate: true });
  return { state: readonly(state), subscribeToUpdates };
};

export const useLazyQuery = <TModel>({
  model,
}: {
  model: Ref<Model<TModel>>;
}) => {
  const state = initialState<TModel>();
  const subscribeToUpdates = subscribeQueryToUpdates({ model, state });
  const query = async ({
    selector,
  }: {
    selector: Ref<Filter<TModel> | string | undefined>;
  }) =>
    await queryResults({
      model,
      selector,
      state,
    });
  return { state: readonly(state), query, subscribeToUpdates };
};
