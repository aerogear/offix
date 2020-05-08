import React from 'react';

import { Container } from '../UI';
import { features } from './features';
import { Section } from './styled.components';
import { FeaturesHeader, FeatureList, LineConnectors } from './components';

export function Features() {
  
  const refs = features.map(() => (React.createRef()));
  const lineRefs = features.map(() => React.createRef());

  return (
    <Section>
      <Container maxWidth="1400px">
        <FeaturesHeader />
        <div id="features"></div> {/* Scroll scene trigger point for scroll event */}
        <FeatureList refs={refs} lineRefs={lineRefs} features={features} />
        <LineConnectors refs={refs} lineRefs={lineRefs} />
      </Container>
    </Section>
  );
}
