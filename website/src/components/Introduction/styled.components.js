import styled from 'styled-components';

export const Title = styled.h2`
  margin: 0 auto;
  font-weight: 800;
  text-transform: uppercase;
  @media(min-width:966px) {
    width: 80%;
    font-size: 3rem;
  }
`;

export const Paragraph = styled.p`
  margin-left: auto;
  margin-right: auto;
  @media(min-width:966px) {
    width: 80%;
  }
`;

export const Image = styled.img`
  max-width: 400px;
  margin: 0 auto;
  width: 300px;
  @media(min-width:966px) {
    width: 500px;
  }
`;