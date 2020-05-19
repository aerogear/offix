import styled from 'styled-components';

export const Title = styled.h3`
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 50px;

  @media(max-width:1000px) {
    margin-bottom: 70px;
    font-size: 3rem;
  }
`;

export const Wrapper = styled.div`
  position: relative;
  margin: 0 auto;
  width: 100%;
`;

export const Gif = styled.picture`
  &::after {
    content: '';
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    top: -36px;
    left: 0;
    background: url('/img/browser-frame.png') no-repeat
  }

  @media(max-width:1000px) {
    &::after {
      display: none;
    }
  }
`;