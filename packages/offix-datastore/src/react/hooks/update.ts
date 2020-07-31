import { useReducer } from "react";
import { Model } from "../../Model";
import { reducer, InitialState, ActionType } from "../ReducerUtils";
import { Predicate } from "../../predicates";

export const useUpdate = (model: Model) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

    const update = async (input: any, predicate?: Predicate<unknown>) => {
        if (state.isLoading) { return; }

        dispatch({ type: ActionType.INITIATE_REQUEST });
        try {
            const results = await model.update(input, predicate);
            dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
        } catch (error) {
            dispatch({ type: ActionType.REQUEST_COMPLETE, error });
        }
    };

    return { ...state, update };
};
