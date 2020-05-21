/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = '' } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="mainLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/offix-background.png`} />
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('getting-started.html')}>
              Documentation
            </Button>
            <Button href="https://github.com/aerogear/offix">
              Github
            </Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = '' } = this.props;
    const { baseUrl } = siteConfig;

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}
      >
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const FeatureCallout = () => (
      <div
        className="productShowcaseSection paddingBottom"
        style={{ textAlign: 'center' }}
      >
        <h2>Introduction</h2>
        <div>
          <p>
            Offix allows to execute your GraphQL mutations and queries while your application is offline.
            Offline Mutations are scheduled and persisted (across application restarts) and are replayed when server becomes available again.
          </p>
          <p>
            Offix leverage the <a href="https://www.apollographql.com/">Apollo Cache</a>, allowing users to see their local changes and to perform fully offline workflows.
            Fully featured conflict resolution strategies are provided, as well as interface to build custom ones, ensuring you can build seamless offline experiences.
          </p>
        </div>
      </div>
    );

    const Intro = () => {
      return (
        <React.Fragment>
          <h2 style={{ color: '#f9a338', textAlign: 'center' }}>
            Offix in Action
          </h2>

          <OffixYoutubeDemo/>
        </React.Fragment>
      );
    };

    const OffixYoutubeDemo = () => (
      <Block align="center">
        {[
          {
            content: `<div class="yt-frame">
              <iframe frameBorder="0" width="560" height="310" scrolling="no" marginHeight="0" marginWidth="0" 
              src="https://www.youtube.com/embed/CrYinCtTHds" 
              frameborder="0" allowfullscreen align="middle"></iframe>
            </div>`
          },
        ]}
      </Block>
    );
    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <FeatureCallout />
          <Intro />
        </div>
      </div>
    );
  }
}

module.exports = Index;
