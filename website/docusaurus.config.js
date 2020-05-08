/* eslint-disable */
const versions = require('./versions.json');

module.exports = {
  title: 'Graphback',
  tagline: 'Offix extends Apollo GraphQL for building fully featured offline experiences.',
  url: 'https://offix.dev',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'aerogear', // Usually your GitHub org/user name.
  projectName: 'graphback', // Usually your repo name.
  themeConfig: {
    disableDarkMode: true,
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      // darkTheme: require('prism-react-renderer/themes/dracula'),
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
      // style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [],
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
