import { Model } from "../../Model";
import { ReplicatorQueries } from "../queries/ReplicatorQueries";
import { ReplicatorSubscriptions } from "../subscriptions/ReplicatorSubscriptions";
import { ReplicatorMutations } from "../mutations/ReplicatorMutations";

/**
 * Allows to override graphql queries used for replication
 */
export interface DocumentBuilders {
  mutations?: (model: Model) => ReplicatorMutations;
  subscriptions?: (model: Model) => ReplicatorSubscriptions;
  delta?: (model: Model) => ReplicatorQueries;
};


