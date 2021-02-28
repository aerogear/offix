import { Maybe } from "graphql/jsutils/Maybe";
import { reactive, UnwrapRef } from "vue";
import { ActionType } from "../utils/ActionsTypes";

export interface Action<TModel> {
  type: ActionType;
  data?: Maybe<TModel>;
  error?: Maybe<unknown>;
}

export interface ResultState<TModel> {
  loading: boolean;
  data?: Maybe<TModel>;
  error?: Maybe<unknown>;
}
export interface ReactiveState<TModel> {
  loading: boolean;
  data?: Maybe<UnwrapRef<TModel>>;
  error?: Maybe<unknown>;
}
export const initialState = <TModel>() =>
  reactive<ResultState<TModel>>({ loading: false });

export const changeState = <TModel>({
  action,
  state,
}: {
  state: ReactiveState<TModel>;
  action: Action<TModel>;
}) => {
  switch (action.type) {
    case ActionType.INITIATE_REQUEST:
      return { state, loading: true, error: null };

    case ActionType.REQUEST_COMPLETE:
      return {
        state,
        loading: false,
        data: action.data,
        error: action.error,
      };

    case ActionType.UPDATE_RESULT:
      // Don't update result when request is loading
      if (state.loading) {
        return state;
      }
      return { state, data: action.data };

    default:
      return state;
  }
};
