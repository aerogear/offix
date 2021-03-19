import { computed, defineComponent, h, PropType } from "vue";
import { Todo } from "../../datastore/generated";
import { Empty } from "../UI";
import { TodoItem } from "./TodoItem";

export const TodoList = defineComponent({
  props: {
    todos: {
      type: Array as PropType<Todo[]>,
      required: true,
      default: () => [],
    },
  },
  components: {
    TodoItem,
    Empty,
  },
  setup(props) {
    const noTodos = computed(() => !props.todos || props.todos.length === 0);
    return () =>
      h("div", {}, [
        noTodos.value ? h(<empty />) : null,
        ...props.todos.map((todo) =>
          h(
            <a-card key={todo._id} style='margin: "0.5em 0"'>
              <todo-item todo={todo} />
            </a-card>
          )
        ),
      ]);
  },
});
