import React, { useState, useEffect } from 'react';
import { CRUDEvents } from 'offix-datastore';
import { Button } from 'antd';
import 'antd/dist/antd.css';

import { useFindTodos } from './datastore/hooks';
import { TodoList, AddTodo, Loading, Error, Header } from './components';

const onTodoAdded = (currentData: any[], newData: any) => {
  console.log(JSON.stringify(newData));
  if (!currentData) return newData;
      return currentData.push(newData[0]);

}

const onTodoChanged = (currentData: any[], newData: any[]) => {
  if (!currentData) return [];

  return currentData.map((d) => {
    const index = newData.findIndex((newD) => newD._id === d._id);
    if (index === -1) return d;
    return newData[index];
  });
}

const onTodoRemoved = (currentData: any[], removedData: any[]) => {
  if (!currentData) return [];
  return currentData
    .filter(
      (d) => removedData.findIndex((newD) => newD._id === d._id)
    );
}

function App() {

  const [addView, setAddView] = useState<boolean>(false);
  const  { isLoading: loading, error, data, subscribeToMore } = useFindTodos();
  useEffect(() => {
    const subscriptions = [
      subscribeToMore(CRUDEvents.ADD, (newData) => onTodoAdded(data, newData)),
      subscribeToMore(CRUDEvents.UPDATE, (newData) => onTodoChanged(data, newData)),
      subscribeToMore(CRUDEvents.DELETE, (newData) => onTodoRemoved(data, newData)),
    ];
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, [data, subscribeToMore]);

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
