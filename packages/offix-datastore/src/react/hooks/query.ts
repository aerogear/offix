import { useEffect, useReducer, useCallback } from "react";
import { Model } from "../../Model";
import { Predicate } from "../../predicates";
import { reducer, InitialState, ActionType, Action } from "../ReducerUtils";
import { CRUDEvents } from "../../storage";

type ResultUpdateFunction = (data: any) => any;

const createSubscribeToMore = (model: Model, dispatch: React.Dispatch<Action>) => {
    return (eventType: CRUDEvents, updateResult: ResultUpdateFunction, predicate?: Predicate<unknown>) => {
        // TODO subscribe to specific predicate
        const subscription = model.subscribe(eventType, (event) => {
            const newData = updateResult(event.data);
            dispatch({ type: ActionType.UPDATE_RESULT, data: newData });
        });
        return subscription;
    };
};

export const useQuery = (model: Model, predicate?: Predicate<unknown>) => {
    const [state, dispatch] = useReducer(reducer, InitialState);
    const subscribeToMore = useCallback(createSubscribeToMore(model, dispatch), [model, dispatch]);

    useEffect(() => {
        (async () => {
            if (state.isLoading) { return; }

            dispatch({ type: ActionType.INITIATE_REQUEST });
            try {
                const results = await model.query(predicate);
                dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
            } catch (error) {
                dispatch({ type: ActionType.REQUEST_COMPLETE, error });
            }
        })();
    }, [predicate]);

    return { ...state, subscribeToMore };
};

export const useLazyQuery = (model: Model) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

    const query = async (predicate?: Predicate<unknown>) => {
        if (state.isLoading) { return; }

        dispatch({ type: ActionType.INITIATE_REQUEST });
        try {
            const results = await model.query(predicate);
            dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
        } catch (error) {
            dispatch({ type: ActionType.REQUEST_COMPLETE, error });
        }

        /*
         * Each time the query func is called, a new subscribeToMore
         * funtion is created. The user has to manually unsuscribe from previous
         * subscriptions
         */
        return createSubscribeToMore(model, dispatch);
    };

    return { ...state, query };
};
