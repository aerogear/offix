import { useEffect, useReducer } from "react";
import { CRUDEvents } from "../..";
import { Model } from "../../Model";
import { ActionType } from "../../utils/ActionsTypes";
import { InitialState, reducer } from "../ReducerUtils";

export const useSubscription = (model: Model, eventTypes: CRUDEvents[]) => {
  const [state, dispatch] = useReducer(reducer, InitialState);

  useEffect(() => {
    const subscription = model.subscribe((event) => {
      dispatch({ type: ActionType.REQUEST_COMPLETE, data: event.data });
    }, eventTypes);
    return () => subscription.unsubscribe();
  }, [model, eventTypes]);

  return state;
};
