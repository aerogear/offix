import { defineComponent, h } from "vue";

export const Error = defineComponent({
  name: "Error",
  props: {
    message: {
      type: String,
      required: false,
      default: "",
    },
  },
  setup(props) {
    return () =>
      h(
        <a-result
          status="error"
          title="Oops, it looks like there was an error!"
          subTitle={props.message}
        />
      );
  },
});
