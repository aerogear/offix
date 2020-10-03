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
    loading: boolean;
    data?: any;
    error?: any;
}

export const InitialState: ResultState = { loading: false };

export const reducer = (state: ResultState, action: Action) => {
    switch (action.type) {
        case ActionType.INITIATE_REQUEST:
            return { ...state, loading: true, error: null };

        case ActionType.REQUEST_COMPLETE:
            return { ...state, loading: false, data: action.data, error: action.error };

        case ActionType.UPDATE_RESULT:
            // Don't update result when request is loading
            if (state.loading) { return state; }
            return { ...state, data: action.data };

        default:
            return state;
    }
};
