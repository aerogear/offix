import React, { useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

import { Flex } from '../UI';
import { 
  VideoComponent, 
  Play, 
  Title, 
  Content,
  Modal,
  ModalBackground,
  Close,
  ModalContent,
  YouTube,
  IFrame
} from './styled.components';

function VideoModal({ open, close}) {
  return (
    <Modal open={open} >
      <ModalBackground />
      <Close href='#video' onClick={close}>Close</Close>
      <ModalContent>
        <YouTube>
          <IFrame
            frameBorder="0"
            width="560"
            height="310" scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src="https://www.youtube.com/embed/eHJkNKzS5mg"
            frameBorder="0"
            allowFullScreen
            align="middle"
          />
        </YouTube>
      </ModalContent>
    </Modal>
  );
}

export function Video() {
  const [open, setOpen] = useState(false);

  const toggleModal = (event) => {
    event.preventDefault();
    console.log('here', open);
    setOpen(!open);
  };

  return (
    <>
      <VideoModal open={open} close={toggleModal} />
      <Flex id="video">
        <Content>
          <Title>Offix in action</Title>
          <VideoComponent>
            <Play href="#" onClick={toggleModal}>
              <img src={useBaseUrl('img/play.png')} alt=""/>
            </Play>
          </VideoComponent>
        </Content>
      </Flex>
    </>
  );
}