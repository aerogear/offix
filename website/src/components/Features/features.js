import React from 'react';

export const features = [
  {
    index: 0,
    title: <>Offline support</>,
    imageUrl: 'img/undraw_data_extraction.svg',
    description: (
      <>
        Offix provides first class support for performing GraphQL 
        operations while offline. Mutations are held in a queue 
        that is configured to hold requests while the client is offline. 
      </>
    ),
  },
  {
    index: 1,
    title: <>Flexible conflict resolution</>,
    imageUrl: 'img/undraw_yoga.svg',
    description: (
      <>
        When the client goes offline for long periods of time, it will 
        still be able negotiate local updates with the server state thanks 
        to powerful conflict resolution strategies.
      </>
    ),
  },
  {
    index: 2,
    title: <>Offline subscriptions</>,
    imageUrl: 'img/undraw_online_connection.svg',
    description: (
      <>
        Subscriptions and binary file uploads that work even while the client is offline.
        Optimistic responses are added to the UI immediately and the mutations are persisted
        when the client comes back online.
      </>
    ),
  },
  {
    index: 3,
    title: <>Multi platform support</>,
    imageUrl: 'img/undraw_progressive_app.svg',
    description: (
      <>
        Offix can be easily implemented into native platforms such as React Native, 
        Ionic and Cordova with minimal amounts of configuration.
      </>
    ),
  },
  {
    index: 4,
    title: <>Framework agnostic</>,
    imageUrl: 'img/undraw_code_review.svg',
    description: (
      <>
        Offix can be plugged it into the front-end framework of your choosing. 
        Additional helper methods are provided so Offix can be used through React 
        with the help of React hooks.
      </>
    ),
  },
  {
    index: 5,
    title: <>Seamless Offline UI</>,
    imageUrl: 'img/undraw_usability_testing.svg',
    description: (
      <>
        Offix offers a comprehensive set of features to perform data operations when offline.
        Leveraging optimistic responses and cache updates under the hood results in a seamless 
        and friendly user experience.
      </>
    ),
  },
];