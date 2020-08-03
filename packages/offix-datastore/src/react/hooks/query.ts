import { useEffect, useReducer, useCallback, Dispatch } from "react";
import { Model } from "../../Model";
import { Predicate } from "../../predicates";
import { reducer, InitialState, ActionType, Action, ResultState } from "../ReducerUtils";
import { CRUDEvents } from "../../storage";

const createSubscribeToMore = (model: Model, dispatch: Dispatch<Action>) => {
    return (eventType: CRUDEvents, updateResult: (data: any) => any, predicate?: Predicate<unknown>) => {
        // TODO subscribe to specific predicate
        const subscription = model.subscribe(eventType, (event) => {
            const newData = updateResult(event.data);
            dispatch({ type: ActionType.UPDATE_RESULT, data: newData });
        });
        return subscription;
    };
};

const forceDelta = async (model: Model, state: ResultState, dispatch: Dispatch<Action>,  options?: IQueryOptions) => {
    if (options?.forceDelta && model.replicator && !state.isDeltaForced) {
        await model.replicator.forceDeltaQuery();
        dispatch({ type: ActionType.DELTA_FORCED });
    }
};

interface IQueryOptions {
    forceDelta?: boolean;
}

export const useQuery = (model: Model, predicate?: Predicate<unknown>, options?: IQueryOptions) => {
    const [state, dispatch] = useReducer(reducer, InitialState);
    const subscribeToMore = useCallback(createSubscribeToMore(model, dispatch), [model, dispatch]);

    useEffect(() => {
        (async () => {
            if (state.isLoading) { return; }

            dispatch({ type: ActionType.INITIATE_REQUEST });
            try {
                await forceDelta(model, state, dispatch, options);
                const results = await model.query(predicate);
                dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
            } catch (error) {
                dispatch({ type: ActionType.REQUEST_COMPLETE, error });
            }
        })();
    }, [model, predicate, options]);

    return { ...state, subscribeToMore };
};

export const useLazyQuery = (model: Model, options?: IQueryOptions) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

    const query = async (predicate?: Predicate<unknown>) => {
        if (state.isLoading) { return; }

        dispatch({ type: ActionType.INITIATE_REQUEST });
        try {
            await forceDelta(model, state, dispatch, options);
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
