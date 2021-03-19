import { useReducer } from "react";
import { Filter } from "../../filters";
import { Model } from "../../Model";
import { ActionType } from "../../utils/ActionsTypes";
import { InitialState, reducer } from "../ReducerUtils";

export const useRemove = <T>(model: Model<T>) => {
  const [state, dispatch] = useReducer(reducer, InitialState);

  const remove = async (filter: Filter<T>) => {
    if (state.loading) {
      return;
    }

    dispatch({ type: ActionType.INITIATE_REQUEST });
    try {
      const results = await model.remove(filter);
      dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
      return results;
    } catch (error) {
      dispatch({ type: ActionType.REQUEST_COMPLETE, error });
    }
  };

  return { ...state, remove };
};
