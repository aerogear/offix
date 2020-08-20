import React from 'react';
import { View, Button } from 'react-native';

export const ToggleModal = ({ toggle }) => {
  return(
    <View>
      <Button title="Add" onPress={toggle} />
    </View>
  );
}