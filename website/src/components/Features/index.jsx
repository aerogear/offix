import React from 'react';

import { features } from './features';
import { FeaturesHeader, FeatureList, LineConnectors } from './components';

export function Features() {
  
  const refs = features.map(() => (React.createRef()));
  const lineRefs = features.map(() => React.createRef());

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '300vh', 
      width: '100%', 
    }}>
      <div className="container-deux">
        <FeaturesHeader />
        <div id="features"></div> {/* Scroll scene trigger point for scroll event */}
        <FeatureList refs={refs} lineRefs={lineRefs} features={features} />
        <LineConnectors refs={refs} lineRefs={lineRefs} />
      </div>
    </div>
  );
}
