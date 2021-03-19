import { Dispatch, useCallback, useEffect, useReducer } from "react";
import { Filter } from "../../filters";
import { Model } from "../../Model";
import { CRUDEvents, StoreChangeEvent } from "../../storage";
import { ActionType } from "../../utils/ActionsTypes";
import { Action, InitialState, reducer, ResultState } from "../ReducerUtils";

const onAdded = (currentData: any[], newData: any[]) => {
  if (!currentData) {
    return newData;
  }
  return [...currentData, ...newData];
};

const onChanged = (currentData: any[], newData: any[], primaryKey: string) => {
  if (!currentData) {
    return [];
  }
  // What happens to data that get's updated and falls outside original query filter?
  return currentData.map((d) => {
    const index = newData.findIndex(
      (newD) => newD[primaryKey] === d[primaryKey]
    );
    if (index === -1) {
      return d;
    }
    return newData[index];
  });
};

const onIdSwapped = (
  currentData: any[],
  newData: any[],
  primaryKey: string
) => {
  if (!currentData) {
    return [];
  }

  return currentData.map((d) => {
    const index = newData.findIndex(
      (newD) => newD.previous[primaryKey] === d[primaryKey]
    );
    if (index === -1) {
      return d;
    }
    return newData[index].current;
  });
};

const onRemoved = (
  currentData: any[],
  removedData: any[],
  primaryKey: string
) => {
  if (!currentData) {
    return [];
  }
  return currentData.filter((d) =>
    removedData.findIndex((newD) => newD[primaryKey] === d[primaryKey])
  );
};

export const updateResult = (
  state: ResultState,
  event: StoreChangeEvent,
  primaryKey: string
) => {
  switch (event.eventType) {
    case CRUDEvents.ADD:
      return onAdded(state.data, event.data);

    case CRUDEvents.UPDATE:
      return onChanged(state.data, event.data, primaryKey);

    case CRUDEvents.ID_SWAP:
      return onIdSwapped(state.data, event.data, primaryKey);

    case CRUDEvents.DELETE:
      return onRemoved(state.data, event.data, primaryKey);

    default:
      throw new Error(`Invalid event ${event.eventType} received`);
  }
};

const createSubscribeToUpdates = (
  state: ResultState,
  model: Model,
  dispatch: Dispatch<Action>
) => {
  return (
    eventsToWatch?: CRUDEvents[],
    customEventHandler?: (state: ResultState, data: any) => any
  ) => {
    const subscription = model.subscribe((event) => {
      let newData;

      if (customEventHandler) {
        newData = customEventHandler(state, event.data);
      }
      newData = updateResult(state, event, model.getSchema().getPrimaryKey());

      if (!subscription.closed) {
        // Important to check beacuse Componnent could be unmounted
        dispatch({ type: ActionType.UPDATE_RESULT, data: newData });
      }
    }, eventsToWatch);
    return subscription;
  };
};

export const useQuery = (model: Model, selector?: Filter | string) => {
  const [state, dispatch] = useReducer(reducer, InitialState);
  const subscribeToUpdates = useCallback(
    createSubscribeToUpdates(state, model, dispatch),
    [state, model, dispatch]
  );

  useEffect(() => {
    (async () => {
      if (state.loading) {
        return;
      }

      dispatch({ type: ActionType.INITIATE_REQUEST });
      try {
        let results;
        if (typeof selector === "string") {
          results = await model.queryById(selector as string);
        } else {
          results = await model.query(selector);
        }
        dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
      } catch (error) {
        dispatch({ type: ActionType.REQUEST_COMPLETE, error });
      }
    })();
  }, [model, selector]);
  return { ...state, subscribeToUpdates };
};

export const useLazyQuery = (model: Model) => {
  const [state, dispatch] = useReducer(reducer, InitialState);
  const subscribeToUpdates = useCallback(
    createSubscribeToUpdates(state, model, dispatch),
    [state, model, dispatch]
  );

  const query = async (selector?: Filter | string) => {
    if (state.loading) {
      return;
    }

    dispatch({ type: ActionType.INITIATE_REQUEST });
    try {
      let results;
      if (typeof selector === "string") {
        results = await model.queryById(selector as string);
      } else {
        results = await model.query(selector);
      }
      dispatch({ type: ActionType.REQUEST_COMPLETE, data: results });
    } catch (error) {
      dispatch({ type: ActionType.REQUEST_COMPLETE, error });
    }
  };

  return { ...state, query, subscribeToUpdates };
};
