import { useReducer } from "react";
import { Model } from "../../Model";
import { reducer, InitialState, ActionType } from "../ReducerUtils";
import { Filter } from "../../filters";

export const useRemove = <T>(model: Model<T>) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

    const remove = async (filter?: Filter<T>) => {
        if (state.isLoading) { return; }

        dispatch({ type: ActionType.INITIATE_REQUEST });
        try {
            const results = await model.remove(filter);
            dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
        } catch (error) {
            dispatch({ type: ActionType.REQUEST_COMPLETE, error });
        }
    };

    return { ...state, remove };
};
