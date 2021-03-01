<template>
  <Loading v-if="loading" />
  <Error v-else-if="error" :message="error.message" />
  <div :style="containerStyle" v-else>
    <div style="width: 60%">
      <a-page-header
        :title="isNotToAddView ? 'Offix Todo' : 'Add Todo'"
        @back="isNotToAddView ? null : (isToAddView = false)"
      >
        <template v-slot:extra v-if="isNotToAddView">
          <a-button type="primary" @click="isToAddView = true" ghost>
            Add Todo
          </a-button>
          <a-button type="primary" danger ghost>
            {{ replicating ? "Online" : "Offline" }}
          </a-button>
        </template>
        <TodoList v-if="isNotToAddView" :todos="data" />
        <AddTodo v-else :cancel="cancelAddTodo" />
      </a-page-header>
    </div>
  </div>
</template>
<script lang="ts">
import { NetworkStatusEvent } from "offix-datastore/types/replication/network/NetworkStatus";
import { computed, defineComponent, onMounted, ref, toRefs, watch } from "vue";
import { Error, TodoList } from "./components";
import { datastore } from "./datastore/config";
import { useFindTodos } from "./datastore/hooks";
import Loading from "./components/UI/Loading.vue";
import AddTodo from "./components/forms/AddTodo.vue";
export default defineComponent({
  name: "App",
  components: {
    AddTodo,
    Error,
    Loading,
    TodoList,
  },
  setup() {
    const containerStyle = {
      display: "flex",
      alignItems: "start",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100vw",
      padding: "2em 0",
    };
    const replicating = ref(true);
    const isToAddView = ref(false);
    const isNotToAddView = computed(() => !isToAddView.value);
    const { state, subscribeToUpdates } = useFindTodos();
    const { loading, data, error } = toRefs(state.value);
    console.log({ loading, data, error, state });
    onMounted(() => {
      datastore.getNetworkIndicator()?.subscribe({
        next: (event: NetworkStatusEvent) => {
          if (event.isOnline) {
            datastore.startReplication();
            replicating.value = true;
          } else {
            datastore.stopReplication();
            replicating.value = false;
          }
        },
      });
    });
    watch(
      data,
      () => {
        const subscription = subscribeToUpdates();
        return () => subscription.unsubscribe();
      },
      { deep: true, immediate: true }
    );
    const cancelAddTodo = () => (isToAddView.value = false);
    return {
      containerStyle,
      isToAddView,
      isNotToAddView,
      loading,
      replicating,
      error,
      data,
      cancelAddTodo,
    };
  },
});
</script>
