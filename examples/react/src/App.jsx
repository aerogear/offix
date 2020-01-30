import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';
import { useOfflineMutation } from 'react-offix-hooks';
import { AddTodo, TodoList, Modal, Loading, Error } from './components';
import { GET_TODOS, ADD_TODO } from './gql/queries';
import * as mutateOptions from './helpers/mutateOptions';

const App = () => {
  const client = useApolloClient();

  const { loading, error, data, subscribeToMore } = useQuery(GET_TODOS);
  const [addTodo] = useOfflineMutation(ADD_TODO, mutateOptions.add);
  const [modalActive, setModalActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // set up network listener to
  // detect when app goes offline
  client.networkStatus.onStatusChangeListener({
    // get result and set online state to result
    onStatusChange: ({ online }) => setIsOnline(online),
  });

  useEffect(() => {
    // eslint-disable-next-line
    async () => {
      // check if app is offline and return result
      const offline = await client.networkStatus.isOffline();
      // set network state with result of offline check
      setIsOnline(!offline);
    };
  }, []);

  const toggleModal = () => {
    setModalActive(!modalActive);
  };

  if (loading) return <Loading />;

  if (error) return <Error error={error} />;

  return (
    <>
      <div className="hero hero-sm bg-gradient">
        <div className="hero-body">
          <div className="contain">
            <h1 className="mb-0">OFFIX TODO</h1>
            <p>A simple todo app using offix & graphback</p>
            <span type="text" className="btn btn-outline">
              {(isOnline) ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <Modal
        title="Create a task"
        subtitle=""
        active={modalActive}
        close={toggleModal}
        Component={() => <AddTodo addTodo={addTodo} cancel={toggleModal} />}
      />

      <section className="contain">
        <div className="action-button">
          <button type="button" className="btn btn-primary btn-lg btn-circle" onClick={toggleModal}>
            <i className="icon icon-plus" />
          </button>
        </div>
      </section>

      <section className="contain mt-4em">
        <TodoList todos={data.findAllTodos} subscribeToMore={subscribeToMore} />
      </section>
    </>
  );
};

export default App;
