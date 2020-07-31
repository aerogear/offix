export enum ActionType {
    INITIATE_REQUEST,
    REQUEST_COMPLETE,
}

export interface Action {
    type: ActionType;
    data?: any;
    error?: any;
}

export interface ResultState {
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

        default:
            return state;
    }
};
