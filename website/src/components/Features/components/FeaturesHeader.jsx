import React from 'react';
import { Flex } from '../../UI/Flex';
import { Content, Title, HR } from './styled.components';

export function FeaturesHeader() {
  return (
    <Flex minHeight="30vh" height="auto" width="80%">
      <div>
        <Content>
          <Title>Features</Title>
          <p>
            We leverage the <a href="https://www.apollographql.com/">Apollo Cache</a>, 
            allowing users to see their local changes and to perform fully offline workflows. 
            Fully featured conflict resolution strategies are provided, as well as interface to build 
            custom ones, ensuring you can build seamless offline experiences.
          </p>
        </Content>
        <HR />
      </div>
    </Flex>
  );
}
