import { DeleteOutlined, EditOutlined } from "@ant-design/icons-vue";
import { defineComponent, h, ref } from "@vue/runtime-core";
import { PropType } from "vue";
import { useDeleteTodo } from "../../datastore/hooks";
import EditTodo from "../forms/EditTodo.vue";
import ToggleTodo from "../forms/ToggleTodo.vue";
import { Todo } from "/@/datastore/generated";
export const TodoItem = defineComponent({
  props: {
    todo: {
      type: Object as PropType<Todo>,
      required: true,
    },
  },
  components: {
    ToggleTodo,
    EditTodo,
  },
  setup(props) {
    const { remove: deleteTodo } = useDeleteTodo();
    const edit = ref(false);
    const handleDelete = () => {
      deleteTodo(props.todo)
        .then((res) => console.log("response", res))
        .catch((error: any) => console.log(error));
    };

    return () =>
      h(
        edit.value ? (
          <edit-todo
            todo={props.todo}
            toggleEdit={() => (edit.value = !edit.value)}
          />
        ) : (
          <a-row justify="space-between">
            <a-col>
              <toggle-todo todo={props.todo} />
              <p>
                <b>Description: </b>
                <br />
                {props.todo.description}
              </p>
            </a-col>
            <a-col>
              <a-button type="primary" onClick={() => (edit.value = true)}>
                <EditOutlined />
              </a-button>
              <a-button type="primary" onClick={handleDelete} danger>
                <DeleteOutlined />
              </a-button>
            </a-col>
          </a-row>
        )
      );
  },
});
