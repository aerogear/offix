import React from 'react';
import { View, Text } from 'react-native';

export const Empty = () => {
  return (
    <View style={{ background: '#fff' }}>
      {/* <div className="empty-icon"><i className="icon icon-3x icon-flag" /></div> */}
      <Text>You have no todo items</Text>
      <Text>Click the button to create a new task</Text>
    </View>
  );
};
