import React from 'react';

import { Flex } from '../UI';
import { Title } from './styled.components';

export function Highlight() {
  return (
    <Flex background="#f99f37" color="#fff">
      <Title>Some Highlight Here</Title>
    </Flex>
  );
}