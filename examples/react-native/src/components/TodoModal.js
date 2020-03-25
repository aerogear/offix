import React from 'react';
import { View, Text, Modal } from 'react-native';

export const TodoModal = ({ title, subtitle, active, close, Component }) => {
  return (
    <Modal
      visible={active}
      onRequestClose={close}
    >
      <View>
        <View>
          <Text>{title}</Text>
          <Text>{subtitle}</Text>
        </View>
        <Component />
      </View>
    </Modal>
  );
};
