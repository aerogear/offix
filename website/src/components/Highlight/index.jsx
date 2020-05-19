import React from 'react';

import { Flex } from '../UI';
import { Title, Wrapper, Gif } from './styled.components';

export function Highlight() {

  return (
    <Flex background="#f99f37" color="#fff" minHeight="1000px" height="auto">
        <div>
          <Title>Offix in action</Title>
          <Wrapper>
            <Gif>
              <source className="browser" srcSet="/img/offix-web.gif"
                    media="(min-width: 1000px)" />
              <source className="pixel" srcSet="/img/offix-android.gif"
                    media="(max-width: 999px)" />
              <img src="/img/offix-android.gif" />
            </Gif>
          </Wrapper>
        </div>
    </Flex>
  );
}