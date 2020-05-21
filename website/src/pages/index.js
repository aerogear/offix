import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { Hero } from '../components/Hero';
import { Introduction } from '../components/Introduction';
import { Features } from '../components/Features';
import { Highlight } from '../components/Highlight';
import { Video } from '../components/Video';

export default function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  });


  const content = (!mounted) 
    ? <div style={{ background: '#fff', height: '120vh'}} /> 
    : (
      <>
        <Hero siteConfig={siteConfig} />
        <Introduction />
        <Features />
        <Highlight />
      </>
    );

  return (
    <Layout
      title={siteConfig.title}
      description="Offix <head />"
    >
      { content }
    </Layout>
  );
}
