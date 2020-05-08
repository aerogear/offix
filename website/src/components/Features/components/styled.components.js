import styled from 'styled-components';

export const Title = styled.h3`
  font-size: 2rem;
  font-weight: 600;
`;

export const Content = styled.div`
  text-align: center;
  padding: 6em 0 1em;
`;

export const HR = styled.hr`
  width: 60%;
  margin: 4em auto;
`;

export const Circle = styled.div`
  text-align: center;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f2f2f2;
  position: relative;
`;

export const Image = styled.img`
  width: 60%;
  margin: 0 auto;
`;

export const SVG = styled.svg`
  margin: 0 auto;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 30vh;
  left: 0;
  z-index: -1;
  @media(max-width:966px) {
    display: none;
  }
`;

const getOrder = ({ type, index }) => {
  if (index%2 === 0) {
    return type === 'image' ? 1 : 2;
  }
  return type === 'image' ? 2 : 1;
}

export const FeatureColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40vh;
  width: 50%;
  order: ${getOrder};
  opacity: 0;
  @media (max-width: 966px) {
    width: 100%;
  }
`;