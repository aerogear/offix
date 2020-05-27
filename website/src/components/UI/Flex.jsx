import React from 'react';
import styled from 'styled-components';

export const Flex = styled.div`
  display: flex;
  height: ${props => props.height};
  min-height: ${props => props.minHeight};
  width: ${props => props.width};
  align-items: ${props => props.alignItems};
  justify-content: ${props => props.justifyContent};
  margin: ${props => props.margin};
  background: ${props => props.background};
  color: ${props => props.color};
  order: ${props => props.order};
  ${props => props.overrides}
`;

Flex.defaultProps = {
  width: '100%',
  height: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto'
}