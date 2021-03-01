//@ts-nocheck //FIXME: remove ignore
import { defineComponent, h } from "@vue/runtime-core";

export const Empty = defineComponent({
  setup() {
    return () =>
      h(
        <div class="empty" style={{ background: "#fff" }}>
          <div class="empty-icon">
            <i class="icon icon-3x icon-flag" />
          </div>
          <p class="empty-title h5">You have no todo items</p>
          <p class="empty-subtitle">Click the button to create a new task</p>
        </div>
      );
  }
});
