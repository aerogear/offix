export enum ActionType {
    INITIATE_REQUEST,
    REQUEST_COMPLETE,
    UPDATE_RESULT,
    DELTA_FORCED
}

export interface Action {
    type: ActionType;
    data?: any;
    error?: any;
}

export interface ResultState {
    isDeltaForced?: boolean;
    isLoading: boolean;
    data?: any;
    error?: any;
}

export const InitialState: ResultState = { isLoading: false };

export const reducer = (state: ResultState, action: Action) => {
    switch (action.type) {
        case ActionType.INITIATE_REQUEST:
            return { ...state, isLoading: true, error: null };

        case ActionType.REQUEST_COMPLETE:
            return { ...state, isLoading: false, data: action.data, error: action.error };

        case ActionType.UPDATE_RESULT:
            // Don't update result when request is loading
            if (state.isLoading) { return state; }
            return { ...state, data: action.data };

        case ActionType.DELTA_FORCED:
            return { ...state, isDeltaForced: true };

        default:
            return state;
    }
};
