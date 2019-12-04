import React, { ReactElement, ReactNode, useContext } from 'react';
import { ApolloOfflineClient } from 'offix-client';

const ApolloOfflineContext = React.createContext<null | ApolloOfflineClient>(null);

export interface ApolloOfflineProviderProps {
  readonly children?: ReactNode;
  readonly client: ApolloOfflineClient;
}

/**
 * 
 * The ApolloOfflineProvider is a Context Provider that lets us initialize the
 * offix client once in our app and then we can access it from any other component in our app
 * using `useOffixClient`
 */
export function ApolloOfflineProvider({ client, children }: ApolloOfflineProviderProps): ReactElement<ApolloOfflineProviderProps> {
  return (
    <ApolloOfflineContext.Provider value={client}>{children}</ApolloOfflineContext.Provider>
  );
}

export function useApolloOfflineClient(overrideClient?: ApolloOfflineClient): ApolloOfflineClient {
  const client = useContext(ApolloOfflineContext);

  // Ensures that the number of hooks called from one render to another remains
  // constant, despite the Apollo client read from context being swapped for
  // one passed directly as prop.
  if (overrideClient) {
    return overrideClient;
  }

  if (!client) {
    throw new Error(
      'Could not find "client" in the context or passed in as a prop. ' +
        'Wrap the root component in an <ApolloOfflineProvider>, or pass an ' +
        'ApolloOfflineProvider instance in via props.'
    );
  }
  return client;
}
