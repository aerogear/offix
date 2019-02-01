import Keycloak from "keycloak-js";
import console from "loglevel";
import { KeycloakInitOptions, KeycloakInstance, KeycloakProfile } from "keycloak-js";
import { ServiceConfiguration, ConfigurationService } from "@aerogear/core";

/**
 * AeroGear Auth SDK.
 * Wrapper class for {Keycloak.KeycloakInstance}
 */
export class Auth {

  public static readonly TYPE: string = "keycloak";

  private auth: KeycloakInstance;
  private internalConfig: any;

  constructor(config: ConfigurationService) {
    const configuration = config.getConfigByType(Auth.TYPE);
    if (configuration && configuration.length > 0) {
      const serviceConfiguration: ServiceConfiguration = configuration[0];
      this.internalConfig = serviceConfiguration.config;
      // create a resource field containing the clientID. The keycloak JS adapter expects a clientId.
      if (!this.internalConfig.clientId) {
        this.internalConfig.clientId = this.internalConfig.resource;
      }
      // use the top level keycloak url in the mobile services json
      this.internalConfig.url = serviceConfiguration.url;
    } else {
      console.warn("Keycloak configuration is missing. Authentication will not work properly.");
    }
    this.auth = Keycloak(this.internalConfig);
  }

  /**
   * Called to initialize the adapter.
   * @param initOptions Initialization options.
   * @returns A promise to set functions to be invoked on success or error.
   */
  public init(initOptions: KeycloakInitOptions): Promise<boolean> {
    if (!initOptions.onLoad) {
      initOptions.onLoad = "check-sso";
    }
    return new Promise((resolve, reject) => {
      return this.auth.init(initOptions).error(reject).success(resolve);
    });
  }

  /**
   * Loads the user's profile.
   * @returns A promise to set functions to be invoked on success or error.
   */
  public loadUserProfile(): Promise<KeycloakProfile> {
    return new Promise((resolve, reject) => {
      return this.auth.loadUserProfile().error(reject).success(resolve);
    });
  }

  /**
   * Redirects to login form.
   * @param options Login options.
   */
  public login(): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.auth.login().error(reject).success(resolve);
    });
  }

  /**
   * Redirects to logout.
   * @param options Logout options.
   * @param options.redirectUri Specifies the uri to redirect to after logout.
   */
  public logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.auth.logout().error(reject).success(resolve);
    });
  }

  public isAuthenticated(): boolean {
    return !!this.auth.authenticated;
  }

  /**
   * Get access to wrapped Keycloak object
   */
  public extract(): KeycloakInstance {
    return this.auth;
  }

  /**
   * Check it the user has a specified realm role
   */
  public hasRealmRole(role: string): boolean {
    return this.auth.hasRealmRole(role);
  }

  /**
   * Return the users realm level roles
   */
  public getRealmRoles(): string[] {
    if (this.auth.realmAccess && this.auth.realmAccess.roles) {
      return this.auth.realmAccess.roles;
    }
    return [];
  }
  /**
   * Return the config used for the auth service
   */
  public getConfig(): string[] {
    return this.internalConfig;
  }

  /**
   * Return true if config is present
   */
  public hasConfig(): boolean {
    return !!this.internalConfig;
  }

  /**
   * Provides an Authorization Bearer header token
   * @param tokenUpdateTime time (in seconds) to refresh the token
   */
  public getHeaderProvider(tokenUpdateTime: number = 10) {
    return () => {
      const tokenUpdate = this.extract().updateToken(tokenUpdateTime) as any;
      // Keycloak doesn't use a proper promise. Instead it uses success/error.
      return new Promise((resolve, reject) => {
        tokenUpdate.success(() => {
          resolve({ "Authorization": "Bearer " + this.auth.token });
        }).error((error: any) => {
          console.info("Cannot update keycloak token", error);
          reject(error);
        });
      });
    };
  }

}
