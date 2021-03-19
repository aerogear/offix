<template>
  <a-col class="ant-form-vertical">
    <a-input v-model:value="title" name="title" />
    <a-textarea name="description" v-model:value="description" auto-size />
    <a-button @click="toggleEdit">Cancel</a-button>
    <a-button @click="handleSubmit" style="float: 'right'">Submit</a-button>
  </a-col>
</template>
<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from "vue";
import { Todo } from "../../datastore/generated";
import { useEditTodo } from "../../datastore/hooks";

export default defineComponent({
  name: "EditTodo",
  props: {
    toggleEdit: {
      type: Function,
      required: true,
    },
    todo: {
      type: Object as PropType<Todo>,
      required: true,
    },
  },
  setup(props) {
    const { update: updateTodo } = useEditTodo();
    const title = ref("");
    const description = ref("");
    onMounted(() => {
      title.value = props.todo.title ?? "";
      description.value = props.todo.description ?? "";
    });
    const handleSubmit = () => {
      updateTodo({
        ...props.todo,
        title: title.value,
        description: description.value,
        _version: props.todo._version ?? 1,
      })
        .then(() => props.toggleEdit())
        .catch((error: any) => console.log(error));
    };
    return { title, description, handleSubmit };
  },
});
</script>
