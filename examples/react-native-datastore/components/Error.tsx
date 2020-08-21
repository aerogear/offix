import React from 'react';
import { View, Text } from 'react-native';

export const Error = (message: any) => {
  return (
    <View>
      <Text>There was an error</Text>
      <Text>Try refreshing the page.</Text>
    </View>
  );
};
