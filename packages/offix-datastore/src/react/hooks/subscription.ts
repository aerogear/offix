import { useEffect, useReducer } from "react";
import { Model } from "../../Model";
import { CRUDEvents } from "../..";
import { Predicate } from "../../predicates";
import { InitialState, reducer, ActionType } from "../ReducerUtils";

export const useSubscription = (model: Model, eventType: CRUDEvents, predicate?: Predicate<unknown>) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

    useEffect(() => {
        // TODO subcribe using predicate
        const subscription = model.subscribe(eventType, (event) => {
            dispatch({ type: ActionType.REQUEST_COMPLETE, data: event.data });
        });
        return () => subscription.unsubscribe();
    }, [model, eventType, predicate]);

    return state;
};
