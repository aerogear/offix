import Keycloak from "keycloak-js";

export class AuthService{
    static auth: any = {};

    loadUserProfile(): any {
        // Retrieve User Profile
        return new Promise((resolve, reject) => {
            AuthService.auth.authz.loadUserProfile().success((profile: any) => {
                resolve(<object>profile);
            }).error(() => {
                reject('Failed to retrieve user profile');
            });
        });
    }

    login(): void{
        AuthService.auth.authz.login();
    }

    logout(): void{
        AuthService.auth.authz.logout();
    }

    isAuthenticated(): boolean{        
        return AuthService.auth.authz.authenticated;
    }

    static init(keycloakConfig: any) : Promise<any> {
        if(keycloakConfig){
            let keycloak = Keycloak(keycloakConfig);            
            return new Promise((resolve, reject) => {
                keycloak.init({ onLoad: 'check-sso' }).success(() => {
                    AuthService.auth.authz = keycloak;
                    resolve();
                }).error((err) => {                    
                    reject(err);
                });
            });
        }
        
        return new Promise((resolve: any, reject: any) => { return resolve() });
    }
}