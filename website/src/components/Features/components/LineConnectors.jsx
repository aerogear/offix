import React from 'react';
import { gsap } from 'gsap';
import { ScrollScene } from 'scrollscene';
import { SVG } from './styled.components';
import { useWindowSize } from '../../useWindowSize';

function useLineAnimation({ lineRefs }) {
  React.useEffect(() => {
    const trigger = document.getElementById('features');
    const timeline = gsap.timeline({ paused: true, duration: 300 });

    lineRefs.forEach((ref, index) => {
      if (ref && ref.current) {
        timeline.from(ref.current, {
          opacity: 0,
          delay: index * 100,
          duration: 250
        });
      }
    });

    new ScrollScene({
      triggerElement: trigger,
      triggerHook: 0.2,
      offset: 100,
      duration: 250,
      gsap: { 
        timeline,
      },
    });
  })
}

const Line = React.forwardRef(({ p1, p2 }, ref) => { 
  const x1 = p1.offsetLeft + (p1.offsetWidth/2);
  const x2 = p2.offsetLeft + (p2.offsetWidth/2);
  const y1 = p1.offsetTop - (p1.offsetHeight/2);
  const y2 = p2.offsetTop - (p2.offsetHeight/2);
  return <line ref={ref} x1={x1} x2={x2} y1={y1} y2={y2} stroke="#222" />
});

export function LineConnectors({ refs, lineRefs }) {

  const [allRefs, setAllRefs] = React.useState([]);
  useLineAnimation({ lineRefs });
  useWindowSize();

  React.useEffect(() => {
    setAllRefs(refs);
  }); 

  return (
    <SVG>
      {
        allRefs && allRefs.length && (
          allRefs.map(({ current }, index) => {
            const next = allRefs[index+1];
            if (!current || next === undefined) return null;
            return <Line key={index} ref={lineRefs[index]} p1={current} p2={next.current}/>;
          })
        )
      }
    </SVG>
  );
};