/**
 * The various change events that can occur on Local Database
 */
export enum CRUDEvents {
  /**
   * Data was added to the local database
   */
  ADD = "ADD",

  /**
   * Data was updated in the local database
   */
  UPDATE = "UPDATE",

  /**
   * Data was deleted from local database
   */
  DELETE = "DELETE"
}
