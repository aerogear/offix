import { useEffect, useReducer } from "react";
import { CRUDEvents } from 'offix-datastore';
import { TodoModel } from '../datasync/config';
import { ITodo, HookState, ActionType, ReducerAction } from "../types";
import { Predicate } from "offix-datastore/types/predicates";
import { Subscription } from "offix-datastore/types/utils/PushStream";
import { uuid } from "uuidv4"

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
    subscriptions.push(TodoModel.on(CRUDEvents.ADD, refreshState));
    subscriptions.push(TodoModel.on(CRUDEvents.UPDATE, refreshState));
    subscriptions.push(TodoModel.on(CRUDEvents.DELETE, refreshState));

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
  const addTodo = async (todo: ITodo) => {
    dispatch({ type: ActionType.REQ_START });
    try {
      todo.id = uuid();
      // TODO temp hack to get thru typing issue (no support for optionals)
      const result = await TodoModel.save(todo as any);
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
