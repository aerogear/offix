import { Model } from "../../Model";
import { ActionType } from "../../utils/ActionsTypes";
import { changeState, initialState } from "../StateUtils";

export const useUpdate = <TInput, TModel>(model: Model<TModel>) => {
  const state = initialState<TModel>();

  const update = async (input: TInput, upsert: boolean = false) => {
    if (state.loading) return;

    changeState<TModel>({
      state,
      action: { type: ActionType.INITIATE_REQUEST },
    });
    try {
      const results = await (upsert
        ? model.saveOrUpdate(input)
        : model.updateById(input));
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

  return { state, update };
};
