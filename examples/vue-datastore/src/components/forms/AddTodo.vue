<template>
  <a-col class="ant-form-vertical">
    <a-input v-model:value="title" name="title" />
    <a-textarea name="description" v-model:value="description" auto-size />
    <a-button @click="cancel()">Cancel</a-button>
    <a-button @click="handleSubmit" style="float: 'right'">Submit</a-button>
  </a-col>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { useAddTodo } from "../../datastore/hooks";

export default defineComponent({
  name: "AddTodo",
  props: {
    cancel: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const { save: addTodo } = useAddTodo();

    const title = ref("");
    const description = ref("");

    const handleSubmit = () => {
      addTodo({
        title: title.value,
        description: description.value,
        completed: false,
      })
        .then(() => props.cancel())
        .catch((error: any) => console.log(error));
    };
    return { title, description, handleSubmit };
  },
});
</script>
