import React from 'react';
import { Container, Flex, Row} from '../UI';
import { Title, Paragraph, Image } from './styled.components';

export function Introduction() {
  return (
    <Flex background="#009CC6" minHeight="100vh">
      <Container>
        <Row>
          <Flex minheight="100%" height="auto" color="#fff" overrides={overrides}>
            <div style={{ width: '80%' }}> 
              <Title>Offline First!</Title>
              <Paragraph>
                Offix allows you to execute your GraphQL mutations and queries while your application is offline, 
                or while the server is unreachable. Offline Mutations are scheduled and persisted across application restarts, 
                and are replayed when server becomes available again.
              </Paragraph>
            </div>
          </Flex>
          <Flex height="100%" overrides={overrides}>
            <Image src={'img/undraw_contrast.svg'} />
          </Flex>
        </Row>
      </Container>
    </Flex>
  );
}

const overrides =`
  width: 50%;
  @media(max-width:966px) {
    width: 100%;
  }
`