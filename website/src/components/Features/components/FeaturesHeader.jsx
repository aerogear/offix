import React from 'react';
import styles from '../styles.module.css';
import { Flex } from '../../Flex';

export function FeaturesHeader() {
  return (
    <Flex height="30vh" width="80%">
      <div className="text--center" style={{ padding: '5em 0' }}>
        <h3 className={styles.featureTitle}>Features</h3>
        <p>We leverage the <a href="https://www.apollographql.com/">Apollo Cache</a>, allowing users to see their local changes and to perform fully offline workflows. Fully featured conflict resolution strategies are provided, as well as interface to build custom ones, ensuring you can build seamless offline experiences.</p>
      </div>
      <hr style={{ width: '60%', margin: '0 auto' }}/> 
    </Flex>
  );
}
