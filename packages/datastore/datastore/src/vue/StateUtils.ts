import { Maybe } from "graphql/jsutils/Maybe";
import { reactive } from "vue";
import { ActionType } from "../utils/ActionsTypes";

export interface Action<TModel> {
  type: ActionType;
  data?: Maybe<Maybe<TModel>[] | TModel>;
  error?: Maybe<unknown>;
}

export interface IdSwap<TModel> {
  previous: TModel;
  current: TModel;
}
export interface ReactiveState<TModel> {
  loading: boolean;
  data: Maybe<TModel>[];
  error: Maybe<unknown>;
}
export const initialState = <TModel>(): ReactiveState<TModel> =>
  reactive<ReactiveState<TModel>>({
    loading: false,
    data: [],
    error: null,
  }) as ReactiveState<TModel>;

export const changeState = <TModel>({
  action,
  state,
}: {
  state: ReactiveState<TModel>;
  action: Action<TModel>;
}) => {
  const data = (() => {
    if (action.data == null) return [];
    if (Array.isArray(action.data)) return action.data;
    return [action.data];
  })();
  switch (action.type) {
    case ActionType.INITIATE_REQUEST:
      state.loading = true;
      state.error = null;
      break;
    case ActionType.REQUEST_COMPLETE:
      state.loading = false;
      state.data = data;
      state.error = action.error;
      break;
    case ActionType.UPDATE_RESULT:
      // Don't update result when request is loading
      if (!state.loading) {
        state.data = data;
      }
      break;
  }
  return state;
};
