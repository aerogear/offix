import { Filter } from "../../filters";

/**
 * @param predicate predicate you wish to be transformed to filter.
 */
export function convertFilterToGQLFilter(filter: Filter): any {
  // TODO discard this function if filter is always the same as GQL filter
  return filter;
}
