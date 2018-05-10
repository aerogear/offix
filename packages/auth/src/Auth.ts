import { coreInstance, ServiceConfiguration } from "@aerogear/core";
import Keycloak from "keycloak-js";
import { KeycloakError, KeycloakInitOptions, KeycloakInstance, KeycloakProfile, KeycloakPromise } from "keycloak-js";
import console from "loglevel";

/**
 * AeroGear Auth SDK.
 * Wrapper class for {Keycloak.KeycloakInstance}
 */
export class Auth {

  public static readonly TYPE: string = "keycloak";

  private auth: KeycloakInstance;
  private internalConfig: any;

  constructor() {
    const configuration = coreInstance.getConfigByType(Auth.TYPE);
    if (!configuration || configuration.length === 0) {
      console.warn("Keycloak configuration is missing. Authentication will not work properly.");
      this.internalConfig = {};
    } else {
      this.internalConfig = configuration[0].config;
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
}
