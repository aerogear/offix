import React, { useRef, useEffect } from 'react';
import classnames from 'classnames';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import { animations } from './animations';


export function Hero({ siteConfig }) {
  const logo = useRef();
  const title = useRef();
  const tagline = useRef();
  const cta = useRef();

  useEffect(() => {
    animations.logo({ logo: logo.current });
    animations.title({ title: title.current });
    animations.tagline({ tagline: tagline.current });
    animations.cta({ cta: cta.current });
  });

  return (
    <header className={classnames('hero hero--primary', styles.heroBanner, styles.heroGraphback)}>
      <div className="container">
        <div className="row">
          <div className="col col--6 col--offset-3 text--center">
            <div>
              <div ref={logo} className={styles.heroImage}>
                <img src="/img/offix-logo.png" alt="logo" />
              </div>
              <p ref={title} className="hero__title">Offix</p>
              <p ref={tagline} className="hero__subtitle">{siteConfig.tagline}</p>
              <div ref={cta} className={styles.buttons}>
                <Link
                  className={classnames(
                    'button button--primary button--lg button--rounded',
                    styles.getStarted,
                  )}
                  to={useBaseUrl('docs/getting-started')}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}