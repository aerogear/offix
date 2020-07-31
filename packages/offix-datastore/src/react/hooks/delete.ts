import { useReducer } from "react";
import { Model } from "../../Model";
import { reducer, InitialState, ActionType } from "../ReducerUtils";
import { Predicate } from "../../predicates";

export const useRemove = (model: Model) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

    const remove = async (predicate?: Predicate<unknown>) => {
        if (state.isLoading) { return; }

        dispatch({ type: ActionType.INITIATE_REQUEST });
        try {
            const results = await model.remove(predicate);
            dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
        } catch (error) {
            dispatch({ type: ActionType.REQUEST_COMPLETE, error });
        }
    };

    return { ...state, remove };
};
