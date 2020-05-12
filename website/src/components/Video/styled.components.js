import styled from 'styled-components';

export const Content = styled.div`
  text-align: center;
`;

export const Title = styled.h3`
  font-size: 3rem;
  font-weight: 900;
`;

export const Play = styled.a`
  width: 35%;
`;

export const VideoComponent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 800px;
  height: 500px;
  margin: 0 auto;
  background:   
    linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
    url(/img/offix-background.png);
  border-radius: 1rem;
  box-shadow: 
    0 1px 2px -2px rgba(0, 0, 0, 0.16), 
    0 3px 6px 0 rgba(0, 0, 0, 0.12), 
    0 5px 12px 4px rgba(0, 0, 0, 0.09);
  @media(max-width:966px) {
    width: 320px;
    height: 200px;
  }
`;

export const Modal = styled.div`
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: ${(prop) => prop.open ? 1 : 0};
  visibility: ${(prop) => prop.open ? 'visible' : 'hidden'};
  -webkit-transition: opacity 1.0s ease-in, visibility 1.0s ease-in;
      -moz-transition: opacity 1.0s ease-in, visibility 1.0s ease-in;
        -o-transition: opacity 1.0s ease-in, visibility 1.0s ease-in;
            transition: opacity 1.0s ease-in, visibility 1.0s ease-in;
`;

export const ModalBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 11;
  background: rgba(0,0,0,0.9);
`;

export const Close = styled.a`
  position: fixed;
  z-index: 13;
  top: calc(60px + 1rem);
  right: 2rem;
  color: #fff !important;
  text-decoration: underline;
`;

export const ModalContent = styled.div`
  position: sticky;
  z-index: 12;
  top: 50%;
  transform: translateY(-50%);
`;

export const YouTube = styled.div`
  position: relative; 
  width: 75%;
  padding-top: 25px; 
  padding-bottom: 50%;
  margin: 0 auto;
  @media(max-width:966px) {
    width: 100%;
  }
`;

export const IFrame = styled.iframe`
  border: 2px solid #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  height: 70%;
  width: 70%;
  transform: translateX(-50%) translateY(-50%);
  @media(max-width:966px) {
    width: 90%;
    height: 90%;
  }
`;