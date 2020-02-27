import  { useEffect, useState } from "react";
import { useApolloOfflineClient } from "./ApolloOfflineProvider";
import { NetworkStatusChangeCallback } from "offix-client";

/**
 * React hook to detect network changes
 * and return current network state
 *
 * Usage: const isOnline = useNetworkStatus();
 *
 */
export function useNetworkStatus(){
  const client = useApolloOfflineClient();
  const [isOnline, setIsOnline] = useState();

  useEffect(() => {
    async function setOnlineStatus() {
      // check if app is offline and return result
      const offline = await client.networkStatus.isOffline();
      // set network state with result of offline check
      setIsOnline(!offline);
    };

    setOnlineStatus();

    // get result and set online state to result
    const listener: NetworkStatusChangeCallback = ({ online }) => setIsOnline(online);

    // set up network listener to
    client.networkStatus.addListener(listener);

    return function cleanup() {
      client.networkStatus.removeListener(listener);
    };
  }, [client]);

  return isOnline;
};
