import { useEffect, useReducer } from "react";
import { DatabaseEvents } from 'offix-datastore';
import { TodoModel } from '../config/datastoreConfig';
import { ITodo, HookState, ActionType, ReducerAction, ITodoModel } from "../types";
import { Predicate } from "offix-datastore/types/predicates";
import { Subscription } from "offix-datastore/types/utils/PushStream";

function reducer(state: HookState, action: ReducerAction) {
  switch (action.type) {
    case ActionType.REQ_START:
      return { ...state, loading: true, data: null, error: null };
    case ActionType.REQ_SUCCESS:
      return { ...state, loading: false, data: action.payload, error: null };
    case ActionType.REQ_FAILED:
      return { ...state, loading: false, data: null, error: action.payload };
    default:
      throw new Error("Invalid action");
  }
}

const initialState: HookState = {
  data: null,
  loading: false,
  error: null
};

export const useFindTodos = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshState = async () => {
    const result = await TodoModel.query();
    dispatch({ type: ActionType.REQ_SUCCESS, payload: result });
  }

  useEffect(() => {
    (function () {
      dispatch({ type: ActionType.REQ_START });
      try {
        refreshState();
      } catch (error) {
        dispatch({ type: ActionType.REQ_FAILED, payload: error });
      }
    })();

    const subscriptions: Array<Subscription> = [];
    subscriptions.push(TodoModel.on(DatabaseEvents.ADD, refreshState));
    subscriptions.push(TodoModel.on(DatabaseEvents.UPDATE, refreshState));
    subscriptions.push(TodoModel.on(DatabaseEvents.DELETE, refreshState));

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    }
  }, []);

  return {
    ...state, data: state.data ? state.data : []
  }
}

export const useAddTodo = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const addTodo = async (todo: ITodoModel) => {
    dispatch({ type: ActionType.REQ_START });
    try {
      const result = await TodoModel.save(todo);
      dispatch({ type: ActionType.REQ_SUCCESS, payload: result });
      return result;
    } catch (error) {
      dispatch({ type: ActionType.REQ_FAILED, payload: error });
    }
  }

  return { addTodo, ...state };
}

export const useEditTodo = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const editTodo = async (todo: ITodo, predicate: Predicate<ITodo>) => {
    dispatch({ type: ActionType.REQ_START });
    try {
      const result = await TodoModel.update(todo, predicate);
      dispatch({ type: ActionType.REQ_SUCCESS, payload: result });
      return result;
    } catch (error) {
      dispatch({ type: ActionType.REQ_FAILED, payload: error });
    }
  }

  return { editTodo, ...state };
}

export const useDeleteTodo = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const deleteTodo = async (predicate: Predicate<ITodo>) => {
    dispatch({ type: ActionType.REQ_START });
    try {
      const result = await TodoModel.remove(predicate);
      dispatch({ type: ActionType.REQ_SUCCESS, payload: result });
      return result;
    } catch (error) {
      dispatch({ type: ActionType.REQ_FAILED, payload: error });
    }
  }

  return { deleteTodo, ...state };
}
