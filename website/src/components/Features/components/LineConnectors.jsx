import React from 'react';
import { gsap } from 'gsap';
import { ScrollScene } from 'scrollscene';

const SVGLine = React.forwardRef(({ x1, x2, y1, y2 }, ref) => {
  return (
    <line
      ref={ref}
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
      stroke="#222"
    />
  );
});

export function LineConnectors({ refs, lineRefs }) {

  const [allRefs, setAllRefs] = React.useState([]);

  React.useEffect(() => {
    setAllRefs(refs);
  }); 

  React.useEffect(() => {
    const trigger = document.getElementById('features');
    const timeline = gsap.timeline({ paused: true, duration: 300 });

    lineRefs.forEach((ref, index) => {
      timeline.from(ref.current, {
        opacity: 0,
        delay: index * 100,
        duration: 250
      });
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
  });

  return (
    <svg
      style={{ 
        margin: '0 auto',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '30vh',
        left: 0,
        zIndex: -1
      }}
    >
      {
        allRefs && allRefs.length && (
          allRefs.map(({ current }, index) => {
            const next = allRefs[index+1];
            if (!current || next === undefined) return null;
            const { offsetLeft: x1, offsetTop: y1 } = current;
            const { offsetLeft: x2, offsetTop: y2 } = next.current;
            return <SVGLine 
              key={index}
              ref={lineRefs[index]}
              x1={x1 + (current.offsetWidth/2)} 
              x2={x2 + (next.current.offsetWidth/2)} 
              y1={y1 - (current.offsetHeight/2)} 
              y2={y2 - (next.current.offsetHeight/2)} />;
          })
        )
      }
    </svg>
  );
};