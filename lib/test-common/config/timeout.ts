export interface GlobalTimeout {
    readonly httpClientRequest: number;

    readonly loginEmailFormDetached: number;
    readonly loginPasswordInput: number;

    readonly navigationWaitForUrl: number;
    readonly navigationResourceLoaded: number;
    readonly navigationLoadingSplash: number;
    readonly navigationAccessToken: number;

    readonly navigationWaitForSignOut: number;
    readonly localServerStarted: number;
}

export const defaultGlobalTimeout: GlobalTimeout = Object.freeze({
    httpClientRequest: 240 * 1000,
    loginEmailFormDetached: 5 * 1000,
    loginPasswordInput: 5 * 1000,
    navigationWaitForUrl: 30 * 1000,
    navigationResourceLoaded: 60 * 1000,
    navigationLoadingSplash: 30 * 1000,
    navigationAccessToken: 30 * 1000,
    navigationWaitForSignOut: 15 * 1000,
    localServerStarted: 30 * 60 * 1000,
});