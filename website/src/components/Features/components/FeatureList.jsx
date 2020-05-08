import React from 'react';
import { gsap } from 'gsap';
import { ScrollScene } from 'scrollscene';

import { Flex } from '../../Flex';
import { ImageWrapper } from './ImageWrapper';
import { ContentWrapper } from './ContentWrapper';

const Feature = React.forwardRef((props, ref) => {
  const { index } = props;

  const left = React.useRef();
  const right = React.useRef();
  const trigger = React.useRef();

  React.useEffect(() => {
    const timeline = gsap.timeline({ paused: true });

    timeline.to(left.current, {
      opacity: 1
    }).to(right.current, {
      opacity: 1
    });

    new ScrollScene({
      triggerElement: trigger.current,
      triggerHook: 0.5,
      offset: 100,
      duration: 300,
      gsap: {
        timeline,
      },
    });

  });

  return (
    <>
      <div className="row" ref={trigger}>
        <div className="col col--6">
          <Flex height="40vh">
            <div ref={left} style={{ opacity: 0 }} >
              { 
                index%2 ==0 
                  ? <ImageWrapper {...props} ref={ref} /> 
                  : <ContentWrapper {...props} /> 
              }
            </div>
          </Flex>
        </div>  
        <div className="col col--6">
          <Flex height="40vh">
            <div ref={right} style={{ opacity: 0 }} >
              { 
                index%2 !=0 
                  ? <ImageWrapper {...props} ref={ref} /> 
                  : <ContentWrapper {...props} /> 
              }
            </div>
          </Flex>
        </div>
      </div>
    </>
  );
});

export function FeatureList({ features, refs, lineRefs}) {
  return features && features.length > 0 && (
    features.map((props, index) => {
      return (
        <Feature 
          key={index}
          ref={refs[index]}
          refs={refs}
          lineRefs={lineRefs}
          {...props}
        />
      );
    })
  )
}