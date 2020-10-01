import { useReducer } from "react";
import { Model } from "../../Model";
import { reducer, InitialState, ActionType } from "../ReducerUtils";

export const useUpdate = <T>(model: Model<T>) => {
    const [state, dispatch] = useReducer(reducer, InitialState);

    const update = async (input: any, upsert: boolean = false) => {
        if (state.isLoading) { return; }
        if (state.data) { return; }

        dispatch({ type: ActionType.INITIATE_REQUEST });
        try {
            const results = await (upsert ?
                model.saveOrUpdate(input): model.updateById(input));
            dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
            return results;
        } catch (error) {
            dispatch({ type: ActionType.REQUEST_COMPLETE, error });
        }
    };

    return { ...state, update };
};
