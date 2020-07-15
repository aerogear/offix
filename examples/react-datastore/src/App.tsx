import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'antd';
import 'antd/dist/antd.css';

import { TodoModel } from './config/datastoreConfig';
import { useFindTodos } from './helpers/hooks';
import { TodoList, AddTodo, Loading, Error, Header } from './components';
import { CRUDEvents } from 'offix-datastore';

function App() {

  const [mounted, setMounted] = useState<boolean>(false);
  // TODO implement a network listener
  const [addView, setAddView] = useState<boolean>(false);
  const  { loading, error, data } = useFindTodos();

  useEffect(() => {
    if (mounted) {
      TodoModel.subscribeForServerEvents(CRUDEvents.ADD)
        .subscribe((res: any) => console.log(res));
    }
    setMounted(true);
    return () => setMounted(false);
    // TODO unsubscribe method
  }, [mounted, setMounted]);

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
                <Badge 
                  status="success"
                  style={{ marginRight: '1em' }}
                  dot
                >
                  <span style={{ marginRight: '1em' }}>Online</span>
                </Badge>
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
