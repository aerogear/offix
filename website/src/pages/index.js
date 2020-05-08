import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { Hero } from '../components/Hero';
import { Introduction } from '../components/Introduction';
import { Features } from '../components/Features/index';
import { Video } from '../components/Video';

export default function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout
      title={siteConfig.title}
      description="Offix <head />"
    > 
      <Hero siteConfig={siteConfig} />
      <Introduction />
      <Features />
      <div style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#FFA939'
      }}>
        <h1 className="gradient--text">Some text here</h1>
      </div>
      <Video />
    </Layout>
  );
}
