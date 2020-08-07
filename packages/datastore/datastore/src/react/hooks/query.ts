import { useEffect, useReducer, useCallback, Dispatch } from "react";
import { Model } from "../../Model";
import { reducer, InitialState, ActionType, Action, ResultState } from "../ReducerUtils";
import { CRUDEvents } from "../../storage";
import { Filter } from "../../filters";

const createSubscribeToMore = (model: Model, dispatch: Dispatch<Action>) => {
    return (eventType: CRUDEvents, updateResult: (data: any) => any, filter?: Filter) => {
        // TODO subscribe to specific predicate
        const subscription = model.subscribe(eventType, (event) => {
            const newData = updateResult(event.data);
            if (subscription.closed) {
                // Important to check beacuse Componnent could be unmounted
                return;
            }
            dispatch({ type: ActionType.UPDATE_RESULT, data: newData });
        });
        return subscription;
    };
};

const forceDelta = async (model: Model, state: ResultState, dispatch: Dispatch<Action>,  options?: IQueryOptions) => {
    if (options?.forceDelta && model.replication && !state.isDeltaForced) {
      // TODO
      // await model.replicator.forceDeltaQuery();
        dispatch({ type: ActionType.DELTA_FORCED });
    }
};

interface IQueryOptions {
    forceDelta?: boolean;
}

export const useQuery = (model: Model, filter?: Filter, options?: IQueryOptions) => {
    const [state, dispatch] = useReducer(reducer, InitialState);
    const subscribeToMore = useCallback(createSubscribeToMore(model, dispatch), [model, dispatch]);

    useEffect(() => {
        (async () => {
            if (state.isLoading) { return; }

            dispatch({ type: ActionType.INITIATE_REQUEST });
            try {
                await forceDelta(model, state, dispatch, options);
                const results = await model.query(filter);
                dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
            } catch (error) {
                dispatch({ type: ActionType.REQUEST_COMPLETE, error });
            }
        })();
    }, [model, filter, options]);

    return { ...state, subscribeToMore };
};

export const useLazyQuery = (model: Model, options?: IQueryOptions) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

    const query = async (filter?: Filter) => {
        if (state.isLoading) { return; }

        dispatch({ type: ActionType.INITIATE_REQUEST });
        try {
            await forceDelta(model, state, dispatch, options);
            const results = await model.query(filter);
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
