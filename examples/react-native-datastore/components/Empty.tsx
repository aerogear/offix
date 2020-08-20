import React from 'react';
import { View, Text } from 'react-native';

export const Empty = () => {
  return (
    <View>
      <Text>You have no todo items</Text>
      <Text>Click the button to create a new task</Text>
    </View>
  );
};
