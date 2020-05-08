/* eslint-disable */
const versions = require('./versions.json');

module.exports = {
  title: 'Offix',
  tagline: 'Offix extends Apollo GraphQL for building fully featured offline experiences.',
  url: 'https://offix.dev',
  baseUrl: '/',
  favicon: 'img/offix-logo.png',
  organizationName: 'aerogear', // Usually your GitHub org/user name.
  projectName: 'offix', // Usually your repo name.
  themeConfig: {
    disableDarkMode: true,
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      defaultLanguage: 'javascript',
    },
    navbar: {
      title: 'Offix',
      logo: {
        alt: 'Offix Logo',
        src: 'img/offix-logo.png',
      },
      links: [
        {
          to: 'docs/gettingstarted',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
          items: [
            {
              label: versions[0],
              to: 'docs/getting-started',
            },
            ...versions.slice(1).map((version) => ({
              label: version,
              to: `docs/${version}/getting-started`,
            })),
            {
              label: 'Master/Unreleased',
              to: 'docs/next/getting-started',
            },
          ],
        },
        {
          to: 'versions',
          label: `v${versions[0]}`,
          position: 'right',
        },
        {
          href: 'https://github.com/aerogear/offix',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/getting-started',
            },
            {
              label: 'Offix Client',
              to: 'docs/offline-client',
            },
            {
              label: 'Platforms',
              to: 'docs/react',
            },
            {
              label: 'Advanced Topics',
              to: 'docs/cookbooks',
            },
            {
              label: 'Releases',
              to: 'docs/release-notes',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/aerogear/offix',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/mJ7j84m',
            },
          ],
        },
      ],
      logo: {
        alt: 'AeroGear Logo',
        src: 'img/aerogear.png',
        href: 'https://aerogear.org/',
      },
      copyright: `Copyright © ${new Date().getFullYear()} AeroGear`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../docs',
          routeBasePath: 'docs',
          sidebarPath: require.resolve('./sidebars.json'),
          editUrl:
            'https://github.com/aerogear/graphback/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
