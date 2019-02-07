
export interface AuthContext {
  header: any;
  token: string;
}

/**
 * Interface for AuthContextProvider
 */
export type AuthContextProvider = () => Promise<AuthContext>;
