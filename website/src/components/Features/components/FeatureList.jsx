import React from 'react';
import { gsap } from 'gsap';
import { ScrollScene } from 'scrollscene';

import { FeatureImage } from './FeatureImage';
import { FeatureContent } from './FeatureContent';
import { Row } from '../../UI';
import { FeatureColumn } from './styled.components';

function useFeatureAnimation({ left, right, trigger }) {
  React.useEffect(() => {
    const timeline = gsap.timeline({ paused: true });

    timeline.to(left.current, {
      opacity: 1,
    }).to(right.current, {
      opacity: 1,
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
}

const Feature = React.forwardRef((props, ref) => {
  const { index } = props;

  const left = React.useRef();
  const right = React.useRef();
  const trigger = React.useRef();

  useFeatureAnimation({ left, right, trigger });

  return (
    <Row ref={trigger}>
      <FeatureColumn type="image" index={index} ref={left}>
        <FeatureImage {...props} ref={ref} />
      </FeatureColumn>
      <FeatureColumn index={index} ref={right}>
        <FeatureContent {...props} /> 
      </FeatureColumn>
    </Row>
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