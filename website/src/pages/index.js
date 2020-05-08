import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { Hero } from '../components/Hero';
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
      {/* <div style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8f8f8  '
      }}></div> */}
      <div style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // background: 'linear-gradient(60deg, #f99f37, #f47d20, #f16223)'
        background: '#009CC6'
      }}>
        <div className="container">
          <div className="row">
            <div className="col col--6">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#fff' }}>
                <div>
                  <h1 className="title">Offline First!</h1>
                  <p style={{ width: '80%' }}>Offix allows you to execute your GraphQL mutations and queries while your application is offline (or while the server is unreachable). Offline Mutations are scheduled and persisted (across application restarts) and are replayed when server becomes available again.</p>
                </div>
              </div>
            </div>
            <div className="col col--6">
              <img src={'img/undraw_contrast.svg'} style={{ width: '80%', margin: '0 auto' }} alt=""/>
            </div>
          </div>
        </div>
      </div>
      <Features />
      {/* <div style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff'
      }}>
        <h1>Some text here</h1>
      </div> */}
      <div style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // background: 'linear-gradient(120deg, #052d56, #063669, #063a6f, #07407b, #084687, #084a8d, #0953a0)'
        background: '#FFA939'
      }}>
        <h1 className="gradient--text">Some text here</h1>
      </div>
      <Video />
    </Layout>
  );
}
