import type { SecretClient } from "@azure/keyvault-secrets";

type TokenCredential = typeof SecretClient extends new (
    ...args: infer P
) => SecretClient
    ? P[1]
    : never;

export interface KeyVaultConfig {
    /** keyvault name to form keyvault url: `https://${name}.vault.azure.net` */
    name: string;
    /**
     * A credential capable of providing an authentication token.
     * @default [DefaultAzureCredential](https://learn.microsoft.com/en-us/dotnet/api/azure.identity.defaultazurecredential?view=azure-dotnet)
     */
    tokenCredential?: TokenCredential;
}

export interface KeyVaultCredentialProvider extends KeyVaultConfig {
    type: 'keyvault';
    /**
     *  A list of usernames to pre-fetch secrets/certificates from keyvault
     *  By default, the key of keyvault secret comes from username by deleting all characters match `/(@.*$|_)/g`
     *  Optionally, keyvault key can be explicitly set by passing an object like `{ key: string, username: string }`
     */
    usernamePool: Array<string | { key?: string; username: string }>;
}

/** @deprecated */
export interface FileCredentialProvider {
    type: 'file';
    path: string;
}

export interface CustomCredentialProvider {
    type: 'custom';
    getUserCredentials: () => Promise<UserCredential[]> | UserCredential[];
}

/** @deprecated: use array of credential providers instead */
export interface MultiCredentialProvider {
    type: 'multi';
    providers: Array<
        | KeyVaultCredentialProvider
        | FileCredentialProvider
        | CustomCredentialProvider
    >;
}

export type CredentialProvider =
    | KeyVaultCredentialProvider
    | FileCredentialProvider
    | CustomCredentialProvider
    | MultiCredentialProvider;

export interface UserPasswordCredential {
    username: string;
    /** @deprecated Password based auth is deprecated, please switch to certificate based auth: https://eng.ms/docs/cloud-ai-platform/azure-data/azure-data-intelligence-platform/microsoft-fabric-platform/fabric-platform-shared-services/power-bi-troubleshooting-guides/troubleshooting/EnableCBA */
    password: string;
}

export interface UserCertificateCredential {
    username: string;
    certificate: Buffer | { pfx: Buffer; passphrase?: string };
}

export type UserCredential = UserCertificateCredential | UserPasswordCredential;
