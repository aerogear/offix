import { useEffect, useReducer, useCallback, Dispatch } from "react";
import { Model } from "../../Model";
import { reducer, InitialState, ActionType, Action, ResultState } from "../ReducerUtils";
import { CRUDEvents } from "../../storage";
import { Filter } from "../../filters";

const createSubscribeToMore = (model: Model, dispatch: Dispatch<Action>) => {
    return (eventType: CRUDEvents, updateResult: (data: any) => any, filter?: Filter) => {
        // TODO subscribe to specific predicate
        const subscription = model.subscribe((event) => {
            const newData = updateResult(event.data);
            if (subscription.closed) {
                // Important to check beacuse Componnent could be unmounted
                return;
            }
            dispatch({ type: ActionType.UPDATE_RESULT, data: newData });
        }, eventType);
        return subscription;
    };
};

export const useQuery = (model: Model, selector?: Filter | string) => {
    const [state, dispatch] = useReducer(reducer, InitialState);
    const subscribeToMore = useCallback(createSubscribeToMore(model, dispatch), [model, dispatch]);

    useEffect(() => {
        (async () => {
            if (state.isLoading) { return; }

            dispatch({ type: ActionType.INITIATE_REQUEST });
            try {
                let results;
                if ((typeof selector) === "string") {
                    results = await model.queryById(selector as string);
                } else {
                    results = await model.query(selector);
                }
                dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
            } catch (error) {
                dispatch({ type: ActionType.REQUEST_COMPLETE, error });
            }
        })();
    }, [model, selector]);
    return { ...state, subscribeToMore };
};

export const useLazyQuery = (model: Model) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

    const query = async (selector?: Filter | string) => {
        if (state.isLoading) { return; }

        dispatch({ type: ActionType.INITIATE_REQUEST });
        try {
            let results;
            if ((typeof selector) === "string") {
                results = await model.queryById(selector as string);
            } else {
                results = await model.query(selector);
            }
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
