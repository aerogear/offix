import styled from 'styled-components';

export const Header = styled.div`
  min-height: 100vh;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 0;
`;

export const HeaderImage = styled.div`
  opacity: 0;
  max-width: 200px;
  heigth: 274px;
  width: 60%;
  margin: 0 auto;
  margin-bottom: 1em;
  transform: translateY(300px);
  @media (max-width: 966px) {
    width: 40%;
  }
`;

export const Title = styled.h1`
  opacity: 0;
  line-height: 7rem;
  font-weight: 900;
  color: #fff ;
  background: linear-gradient(60deg, #f99f37, #f47d20, #f16223);
  font-size: 8rem;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
`;

export const SubTitle = styled.h2`
  opacity: 0;
  font-size: 1.5rem;
  font-weight: 600;
  transform: translateX(-50px);
`;

export const CTA = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(100);
`;