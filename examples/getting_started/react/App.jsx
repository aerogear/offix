import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useOfflineMutation } from 'react-offix-hooks';
import { CacheOperation } from 'offix-cache';
import Modal from './components/Modal';
import AddTodo from './components/AddTodo';
import Loading from './components/Loading';
import Error from './components/Error';
import TodoList from './components/TodoList';
import { GET_TODOS, ADD_TODO } from './gql/queries';

const App = ({ client }) => {

  const { loading, error, data } = useQuery(GET_TODOS);

  if (loading) return <Loading />;

  if (error) return <Error error={error} />;

  const [initialized, setInitialized] = useState(false);
  const [modalActive, setModalActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    async () => {
      // get network status
      const offline = await client.networkStatus.isOffline();
      // set network state
      setIsOnline(!offline);
    }
    setInitialized(true);
  }, []);

  // set up network listener to 
  // detect when app goes offline
  client.networkStatus.onStatusChangeListener({
    onStatusChange: ({online}) => setIsOnline(online),
  });

  const toggleModal = () => {
    setModalActive(!modalActive);
  }

  const [addTodo, addState] = useOfflineMutation(ADD_TODO, {
    updateQuery: GET_TODOS,
    returnType: 'Todo',
    operationType: CacheOperation.ADD,
  });

  // listen for add mutation state changes
  useEffect(() => {
    if(initialized)
      console.log(addState);
  }, [addState]);

  return (
    <>
      <div className="hero hero-sm bg-gradient">
        <div className="hero-body">
          <div className="contain">
            <h1 className="mb-0">OFFIX TODO</h1>
            <p>A simple todo app using offix & graphback</p>
            <button className="btn btn-outline">
              { (isOnline) ? 'Online' : 'Offline' }
            </button>
          </div>
        </div>
      </div>

      <Modal
        title="Create a task"
        subtitle=""
        active={modalActive}
        close={() => {toggleModal}}
        Component={() => <AddTodo addTodo={addTodo} cancel={toggleModal} /> }
      />

      <section className="contain">
        <div className="action-button">
          <button className="btn btn-primary btn-lg btn-circle" onClick={toggleModal}>
            <i className="icon icon-plus" />
          </button>
        </div>
      </section>

      <section className="contain mt-4em">
        <TodoList todos={data.findAllTodos} />
      </section>
    </>
  );
};

export default App;
