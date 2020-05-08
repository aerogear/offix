import React from 'react';
import styles from '../styles.module.css';


export const ContentWrapper = ({ title }) => (
  <div className={styles.featureContent}>
    <h3 className={styles.featureTitle}>{title}</h3>
    {/* <p>{description}</p> */}
    <p>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Harum id magnam tempora suscipit eos sunt perspiciatis impedit labore veritatis sint maiores, cumque dolorem doloribus illo doloremque distinctio earum soluta. Quis?
    </p>
  </div>
);