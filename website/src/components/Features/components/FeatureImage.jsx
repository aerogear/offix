import React from 'react';

import { Circle, Image } from './styled.components';

export const FeatureImage = React.forwardRef(({ index, imageUrl }, ref) => {
  return (
    <Circle id={`circle-${index}`} ref={ref}>
      <Image src={imageUrl} alt=""/>
    </Circle>
  );
});