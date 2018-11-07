
/**
 * User provided configuration error
 */
export class ConfigError extends Error {
  public fieldName: string;

  constructor(message: string, fieldName: string){
    super(message);
    this.fieldName = fieldName;
  }
}
