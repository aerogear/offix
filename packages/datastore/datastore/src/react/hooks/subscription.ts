import { useEffect, useReducer } from "react";
import { Model } from "../../Model";
import { CRUDEvents } from "../..";
import { InitialState, reducer, ActionType } from "../ReducerUtils";
import { Filter } from "../../filters";

export const useSubscription = (model: Model, eventType: CRUDEvents, filter?: Filter) => {
  const [state, dispatch] = useReducer(reducer, InitialState);

  useEffect(() => {
    // TODO subcribe using predicate
    const subscription = model.subscribe((event) => {
      dispatch({ type: ActionType.REQUEST_COMPLETE, data: event.data });
    }, eventType);
    return () => subscription.unsubscribe();
  }, [model, eventType, filter]);

  return state;
};
