import React, { ReactElement, ReactNode, useContext } from 'react';
import { OfflineClient, ApolloOfflineClient } from 'offix-client';

const OffixContext = React.createContext<null | OfflineClient>(null);

export interface OffixProviderProps {
  readonly children?: ReactNode;
  readonly client: OfflineClient;
}

/**
 * 
 * The Offix Provider is a Context Provider that lets us initialize the
 * offix client once in our app and then we can access it from any other component in our app
 * using `useOffixClient`
 */
export function OffixProvider({ client, children }: OffixProviderProps): ReactElement<OffixProviderProps> {
  return (
    <OffixContext.Provider value={client}>{children}</OffixContext.Provider>
  );
}

export function useOffixClient(overrideClient?: OfflineClient): OfflineClient {
  const client = useContext(OffixContext);

  // Ensures that the number of hooks called from one render to another remains
  // constant, despite the Offix client read from context being swapped for
  // one passed directly as prop.
  if (overrideClient) {
    return overrideClient;
  }

  if (!client) {
    throw new Error(
      'Could not find "client" in the context or passed in as a prop. ' +
        'Wrap the root component in an <OffixProvider>, or pass an ' +
        'OfflineClient instance in via props.'
    );
  }
  return client;
}

export function useOffixApolloClient(overrideClient?: ApolloOfflineClient): ApolloOfflineClient {
  const offixClient = useContext(OffixContext);

  // Ensures that the number of hooks called from one render to another remains
  // constant, despite the Offix client read from context being swapped for
  // one passed directly as prop.
  if (overrideClient) {
    return overrideClient;
  }

  if (!offixClient) {
    throw new Error(
      'Could not find "client" in the context or passed in as a prop. ' +
        'Wrap the root component in an <OffixProvider>, or pass an ' +
        'OfflineClient instance in via props.'
    );
  }

  const apolloClient = offixClient.apolloClient

  if (!apolloClient) {
    throw new Error(
      '"apolloClient" is not available on the OfflineClient in the context' +
        'Wrap the root component in an <OffixProvider>, and do not render until' +
        'OfflineClient.init() is finished.'
    );
  }

  return apolloClient;
}
