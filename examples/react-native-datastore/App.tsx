/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Modal,
  Alert,
} from 'react-native';
import { useFindTodos } from './datastore/generated/hooks';

// import { Colors} from 'react-native/Libraries/NewAppScreen';
import { CRUDEvents } from 'offix-datastore';

import { Loading, Error, TodoList, AddTodo, TodoModal } from './components';

declare const global: {HermesInternal: null | {}};

const onTodoAdded = (currentData: any[], newData: any) => {
  if (!currentData) return [newData];
      return [...currentData, newData];
}

const onTodoChanged = (currentData: any[], newData: any[]) => {
  if (!currentData) return [];

  return currentData.map((d) => {
    const index = newData.findIndex((newD) => newD.id === d.id);
    if (index === -1) return d;
    return newData[index];
  });
}

const onTodoRemoved = (currentData: any[], removedData: any[]) => {
  if (!currentData) return [];
  return currentData
    .filter(
      (d) => removedData.findIndex((newD) => newD.id === d.id)
    );
};

const Separator = () => (
  <View style={styles.separator} />
);

const App = () => {
  const [modalActive, setModalActive] = useState(false);
  const  { isLoading: loading, error, data, subscribeToMore } = useFindTodos();

   useEffect(() => {
    const subscriptions = [
      subscribeToMore(CRUDEvents.ADD, (newData: any) => onTodoAdded(data, newData)),
      subscribeToMore(CRUDEvents.UPDATE, (newData: any) => onTodoChanged(data, newData)),
      subscribeToMore(CRUDEvents.DELETE, (newData: any) => onTodoRemoved(data, newData)),
    ];
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, [data, subscribeToMore]);

  const toggleModal = () => {
    setModalActive(!modalActive);
  };

  if (loading) return <Loading />;

  if (error) return <Error message={error.message} />;

  console.log(data);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View>
          <Text>OFFIX TODO React</Text>
          <Text>A simple todo app using offix and graphback</Text>
        </View>
        <TodoModal
          title="Create a task"
          subtitle=""
          active={modalActive}
          close={toggleModal}
          Component={() => <AddTodo cancel={toggleModal} />}
        />
        <Separator />
        <View>
          <Button title="Add" onPress={toggleModal} />
        </View>
        <Separator />
        <View>
          <TodoList todos={data} />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
})

// const styles = StyleSheet.create({
//   scrollView: {
//     backgroundColor: Colors.lighter,
//   },
//   engine: {
//     position: 'absolute',
//     right: 0,
//   },
//   body: {
//     backgroundColor: Colors.white,
//   },
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: Colors.black,
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//     color: Colors.dark,
//   },
//   highlight: {
//     fontWeight: '700',
//   },
//   footer: {
//     color: Colors.dark,
//     fontSize: 12,
//     fontWeight: '600',
//     padding: 4,
//     paddingRight: 12,
//     textAlign: 'right',
//   },
// });

export default App;
