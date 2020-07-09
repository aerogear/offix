import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useNetworkStatus } from 'react-offix-hooks';
import { Button, Badge } from 'antd';
import 'antd/dist/antd.css';

import { GET_TODOS } from './gql/queries';
import { subscriptionOptions } from './helpers';
import { TodoList, AddTodo, Loading, Error, Header } from './components';


function App() {

  const isOnline = useNetworkStatus();
  const [addView, setAddView] = useState<boolean>(false);
  const { loading, error, data, subscribeToMore } = useQuery(GET_TODOS);

  useEffect(() => {
    subscribeToMore(subscriptionOptions.add);
    subscribeToMore(subscriptionOptions.edit);
    subscribeToMore(subscriptionOptions.remove);
  }, [subscribeToMore]);

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
                  status={ isOnline ? 'success' : 'error'}
                  style={{ marginRight: '1em' }}
                  dot
                >
                  <span style={{ marginRight: '1em' }}>{isOnline ? 'Online' : 'Offline'}</span>
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
                  todos={data.findAllTodos} 
                  subscribeToMore={subscribeToMore} 
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
