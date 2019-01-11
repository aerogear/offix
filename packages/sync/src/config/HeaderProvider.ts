
export interface Headers { [header: string]: string; }

/**
 * Interface for HeaderProvider
 */
export type HeaderProvider = () => Promise<Headers>;
