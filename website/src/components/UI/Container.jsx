import styled from 'styled-components';

export const Container = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: ${props => props.maxWidth};
  padding-left: var(--ifm-spacing-horizontal);
  padding-right: var(--ifm-spacing-horizontal);
  width: 100%;
`;

Container.defaultProps = {
  maxWidth: 'var(--ifm-container-width)'
}
