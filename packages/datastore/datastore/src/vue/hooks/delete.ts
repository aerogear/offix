import { Filter } from "../../filters";
import { Model } from "../../Model";
import { ActionType } from "../../utils/ActionsTypes";
import { changeState, initialState } from "../StateUtils";

export const useRemove = <TModel>(model: Model<TModel>) => {
  const state = initialState<TModel>();

  const remove = async (filter: Filter<TModel>) => {
    if (state.loading) return;

    changeState<TModel>({
      state,
      action: { type: ActionType.INITIATE_REQUEST },
    });
    try {
      const results = await model.remove(filter);
      changeState<TModel>({
        state,
        action: { type: ActionType.REQUEST_COMPLETE, data: results },
      });
      return results;
    } catch (error) {
      changeState<TModel>({
        state,
        action: { type: ActionType.REQUEST_COMPLETE, error },
      });
    }
  };

  return { state, remove };
};
