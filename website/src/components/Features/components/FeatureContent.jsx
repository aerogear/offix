import React from 'react';
import { Content, Title } from './styled.components';

export const FeatureContent = ({ title, description }) => (
  <Content>
    <Title>{title}</Title>
    <p>{description}</p>
  </Content>
);