import React from 'react';
import { View, Text } from 'react-native';

export const Error = (message: any) => {
  return (
    <View style={{ background: '#fff' }}>
      {/* <div className="empty-icon"><i className="icon icon-3x icon-flag" /></div> */}
      <Text>There was an error</Text>
      <Text>Try refreshing the page.</Text>
    </View>
  );
};
