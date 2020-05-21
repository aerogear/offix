import React, { useRef, useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import { animations } from './animations';
import { Header, HeaderImage, Title, SubTitle, CTA } from './styled.components';
import { Container } from '../UI';

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
    <Header>
      <Container style={{ marginTop: '-60px' }}>
        <HeaderImage ref={logo}>
          <img src="/img/offix-logo.png" style={{ maxWidth: '200px' }} alt="logo" />
        </HeaderImage>
        <Title ref={title}>Offix</Title>
        <SubTitle ref={tagline}>{siteConfig.tagline}</SubTitle>
        <CTA ref={cta}>
          <Link
            className="button button--primary button--lg button--rounded"
            to={useBaseUrl('docs/getting-started')}>
            Get Started
          </Link>
        </CTA>
      </Container>
    </Header>
  );
}