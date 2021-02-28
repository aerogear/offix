import { Button } from "ant-design-vue";
import { NetworkStatusEvent } from "offix-datastore/types/replication/network/NetworkStatus";
import { defineComponent, h, onMounted, ref, watch } from "vue";
import { AddTodo, Error, Header, Loading, TodoList } from "./components";
import { datastore } from "./datastore/config";
import { useFindTodos } from "./datastore/hooks";

function App() {
  return defineComponent({
    components: {
      Button
    },
    setup() {
      const replicating = ref(true);
      const addView = ref(false);

      const { loading, error, data, subscribeToUpdates } = useFindTodos();

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
          }
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
      // FIXME:
      if (loading) return () => <Loading />;
      // FIXME:
      if (error) return <Error message={error.message} />;

      return () =>
        h(
          <div style={containerStyle}>
            <div style={{ width: "60%" }}>
              <Header
                title={!addView.value ? "Offix Todo" : "Add Todo"}
                onBack={!addView.value ? null : () => (addView.value = false)}
                extra={
                  addView.value ? null : (
                    <>
                      <button
                        type="primary"
                        onClick={() => (addView.value = true)}
                        ghost
                      >
                        Add Todo
                      </button>
                      <button type="primary" danger ghost>
                        {replicating.value ? "Online" : "Offline"}
                      </button>
                    </>
                  )
                }
              >
                {!addView && (
                  <>
                    <TodoList todos={data} />
                  </>
                )}
                {addView && (
                  <>
                    <AddTodo cancel={() => (addView.value = true)} />
                  </>
                )}
              </Header>
            </div>
          </div>
        );
    }
  });
}

const containerStyle = {
  display: "flex",
  alignItems: "start",
  justifyContent: "center",
  minHeight: "100vh",
  width: "100vw",
  padding: "2em 0"
};

export default App;
