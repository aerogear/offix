

/**
 * Delay execution of specific code by using promise await api
 *
 * ```js
 * await delay(4000)
 * ```
 * @param time time to wait
 */
export const delay = (time: number) => new Promise(r => setTimeout(r, time));
