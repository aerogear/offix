<template>
  <a-row>
    <a-switch v-model:checked="checked" />
    {{ label }}
  </a-row>
</template>
<script lang="ts">
import { Todo } from "../../datastore/generated";
import { computed, defineComponent, PropType } from "vue";
import { useEditTodo } from "../../datastore/hooks";
export default defineComponent({
  name: "ToggleTodo",
  props: {
    todo: {
      type: Object as PropType<Todo>,
      required: true,
    },
  },
  setup(props) {
    const { update: updateTodo } = useEditTodo();

    const handleUpdate = (completed: boolean) => {
      updateTodo({
        ...props.todo,
        _version: props.todo._version ?? 1,
        completed: completed,
      })
        .then((res) => console.log("response", res))
        .catch((error: any) => console.log("error", error));
    };
    const checked = computed({
      set: (complited) => {
        handleUpdate(complited);
      },
      get: () => props.todo.completed ?? false,
    });
    return { label: props.todo.title, checked };
  },
});
</script>
