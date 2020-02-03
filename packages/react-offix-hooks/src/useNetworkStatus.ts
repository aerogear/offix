import  { useEffect, useState } from "react";
import { useApolloOfflineClient } from "./ApolloOfflineProvider";

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
    const setOnlineStatus  = async () => {
      // check if app is offline and return result
      const offline = await client.networkStatus.isOffline();
      // set network state with result of offline check
      setIsOnline(!offline);
    };

    setOnlineStatus();

    // set up network listener to
    client.networkStatus.onStatusChangeListener({
      // get result and set online state to result
      onStatusChange: ({ online }) => setIsOnline(online)
    });
  }, []);

  return isOnline;
};
