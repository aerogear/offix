/**
 * Represents the configuration of a single service
 */
export interface ServiceConfiguration {

  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly url: string;
  readonly config: Map<string, any>;
}
