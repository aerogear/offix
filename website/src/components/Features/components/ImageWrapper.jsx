import React from 'react';
import classnames from 'classnames';
import styles from '../styles.module.css';

export const ImageWrapper = React.forwardRef(({ index, imageUrl }, ref) => {
  return (
    <div
      id={`circle-${index}`} 
      ref={ref}
      className={classnames(styles.circle, "text--center")} 
      style={{ position: 'relative '}}
    >
      <img src={imageUrl} style={{ width: '60%', margin: '0 auto' }} alt=""/>
    </div>
  );
});