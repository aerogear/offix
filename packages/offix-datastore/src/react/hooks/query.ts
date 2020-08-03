import { useEffect, useReducer } from "react";
import { Model } from "../../Model";
import { Predicate } from "../../predicates";
import { reducer, InitialState, ActionType } from "../ReducerUtils";

export const useQuery = (model: Model, predicate?: Predicate<unknown>) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

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

    return state;
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
    }

    return { ...state, query };
}
