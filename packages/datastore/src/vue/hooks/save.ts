import { Model } from "../../Model";
import { ActionType } from "../../utils/ActionsTypes";
import { changeState, initialState } from "../StateUtils";

export const useSave = <TInput, TModel>(model: Model<TModel>) => {
  const state = initialState<TModel>();

  const save = async (input: Omit<TInput, "_version" | "_lastUpdatedAt">) => {
    if (state.value.loading) {return;}
    changeState<TModel>({
      state,
      action: { type: ActionType.INITIATE_REQUEST }
    });
    try {
      const results = (await model.save(
        (input as unknown) as Partial<TModel>
      )) as TModel;
      changeState<TModel>({
        state,
        action: { type: ActionType.REQUEST_COMPLETE, data: results }
      });
      return results;
    } catch (error) {
      changeState<TModel>({
        state,
        action: { type: ActionType.REQUEST_COMPLETE, error }
      });
    }
  };

  return { state: state, save };
};
