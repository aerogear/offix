<template>
  <a-result title="Loading..."
    ><template v-slot:icon>
      <a-spin size="large" />
    </template>
  </a-result>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "loading"
});
</script>
