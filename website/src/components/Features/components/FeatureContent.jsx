import React from 'react';
import { Content, Title } from './styled.components';

export const FeatureContent = ({ title }) => (
  <Content>
    <Title>{title}</Title>
    <p>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. 
      Harum id magnam tempora suscipit eos sunt perspiciatis 
      impedit labore veritatis sint maiores, cumque dolorem 
      doloribus illo doloremque distinctio earum soluta. Quis?
    </p>
  </Content>
);