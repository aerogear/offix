import Keycloak from "keycloak-js";
import {KeycloakError, KeycloakInitOptions, KeycloakInstance, KeycloakProfile, KeycloakPromise} from "keycloak-js";
import { Key } from "readline";

/**
 * Wrapper class for {Keycloak.KeycloakInstance}
 */
export class AuthService {

    private auth: KeycloakInstance;

    constructor(config: KeycloakInitOptions) {
      this.auth = Keycloak(config);
    }

  /**
   * Called to initialize the adapter.
   * @param initOptions Initialization options.
   * @returns A promise to set functions to be invoked on success or error.
   */
  public init(initOptions: KeycloakInitOptions): KeycloakPromise<boolean, KeycloakError> {
      if (!initOptions.onLoad) {
        initOptions.onLoad = "check-sso";
      }
      return this.auth.init(initOptions);
    }

    /**
		 * Loads the user's profile.
		 * @returns A promise to set functions to be invoked on success or error.
		 */
    public loadUserProfile(): KeycloakPromise<KeycloakProfile, void> {
        return this.auth.loadUserProfile();
    }

    /**
		 * Redirects to login form.
		 * @param options Login options.
		 */
    public login(): KeycloakPromise<void, void> {
      return this.auth.login();
    }

    /**
		 * Redirects to logout.
		 * @param options Logout options.
		 * @param options.redirectUri Specifies the uri to redirect to after logout.
		 */
    public logout(): KeycloakPromise<void, void> {
      return this.auth.logout();
    }

    public isAuthenticated(): boolean | undefined {
        return this.auth.authenticated;
    }

    /**
     * Get access to wrapped Keycloak object
     */
    public extract(): KeycloakInstance {
      return this.auth;
    }
}
