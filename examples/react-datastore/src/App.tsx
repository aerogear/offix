import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import 'antd/dist/antd.css';

import { useFindTodos } from './datastore/hooks';
import { TodoList, AddTodo, Loading, Error, Header } from './components';
import { datastore } from './datastore/config';
import { NetworkStatusEvent } from 'offix-datastore/types/replication/network/NetworkStatus';

function App() {

  const [replicating, setReplicating] = useState<boolean>(true);
  const [addView, setAddView] = useState<boolean>(false);
  const  { loading, error, data, subscribeToUpdates } = useFindTodos();

  useEffect(() => {
    datastore.getNetworkIndicator()?.subscribe({
      next: (event: NetworkStatusEvent) => {
        if (event.isOnline) {
          datastore.startReplication();
          setReplicating(true);
        } else {
          datastore.stopReplication();
          setReplicating(false);
        }
      }
    })
  })

  useEffect(() => {
    // We can start replication on a per model basis
    // or for the entire store with:
    // datastore.startReplication
    // the `startReplication` method accepts an
    // optional filter
    datastore.startReplication()
  });

  useEffect(() => {
    const subscription = subscribeToUpdates();
    return () => subscription.unsubscribe();
  }, [data, subscribeToUpdates]);

  if (loading) return <Loading />;

  if (error) return <Error message={error.message} />;

  return (
    <div style={containerStyle}>
      <div style={{ width: '60%' }}>
        <Header
          title={!addView ? 'Offix Todo' : 'Add Todo'}
          onBack={
            !addView ? null : () => setAddView(false)
          }
          extra={
            addView ? null : (
              <>
                <Button
                  type="primary"
                  onClick={() => setAddView(true)}
                  ghost
                >
                  Add Todo
                </Button>
                <Button
                  type="primary"
                  danger
                  ghost
                >
                  {
                    replicating ? "Online" : "Offline"
                  }
                </Button>
              </>
            )
          }
        >
          {
            !addView && (
              <>
                <TodoList
                  todos={data}
                />
              </>
            )
          }
          {
            addView && (
              <>
                <AddTodo cancel={() => setAddView(false)} />
              </>
            )
          }
        </Header>
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100vw',
  padding: '2em 0'
}

export default App;
