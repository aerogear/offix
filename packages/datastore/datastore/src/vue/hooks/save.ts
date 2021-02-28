import { useReducer } from "react";
import { Model } from "../../Model";
import { reducer, InitialState, ActionType } from "../ReducerUtils";

export const useSave = (model: Model) => {
	const [state, dispatch] = useReducer(reducer, InitialState);

	const save = async (input: any) => {
		if (state.loading) { return; }

		dispatch({ type: ActionType.INITIATE_REQUEST });
		try {
			const result = await model.save(input);
			dispatch({ type: ActionType.REQUEST_COMPLETE, data: result });
			return result;
		} catch (error) {
			dispatch({ type: ActionType.REQUEST_COMPLETE, error });
		}
	};

	return { ...state, save };
};
