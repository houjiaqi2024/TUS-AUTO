import { SecretClient } from '@azure/keyvault-secrets';
import {
    AzureCliCredential,
    ChainedTokenCredential,
    DeviceCodeCredential,
    EnvironmentCredential,
    InteractiveBrowserCredential,
    useIdentityPlugin,
} from '@azure/identity';
import { cachePersistencePlugin } from '@azure/identity-cache-persistence';
import assert from 'assert';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

useIdentityPlugin(cachePersistencePlugin);

const enableTokenPersistence = {
    tokenCachePersistenceOptions: {
        enabled: true,
        unsafeAllowUnencryptedStorage: !!process.env.CODESPACES,
    },
};

interface KeyVaultConfig {
    name: string;
    tokenCredential?: any;
}

export async function acquireSecret(secretName: string, keyVault: KeyVaultConfig): Promise<string | Buffer> {
    const secrets = await acquireSecrets([secretName], keyVault);
    return secrets[secretName];
}

export async function acquireSecrets(secretNames: string[], keyVault: KeyVaultConfig): Promise<Record<string, string | Buffer>> {
    const { name, tokenCredential } = keyVault;
    const vaultBaseURL = `https://${name}.vault.azure.net/`;
    const client = new SecretClient(vaultBaseURL, tokenCredential ?? (await createTokenCredential()));

    const entries = await Promise.all(
        secretNames.map(async (secretName) => {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const secret = await client.getSecret(secretName);
                    assert(secret.value, `Empty secret value for: ${secretName}`);
                    return [
                        secretName,
                        secret.properties.certificateKeyId ? Buffer.from(secret.value, 'base64') : secret.value,
                    ];
                } catch (error) {
                    console.warn(`Attempt ${attempt} failed for secret: ${secretName}`);
                    if (attempt === 3) throw error;
                    await new Promise((res) => setTimeout(res, 10000));
                }
            }
        }),
    );
    return Object.fromEntries(entries);
}

export async function createTokenCredential() {
    const isCI = !!process.env.CI;
    const isCodespace = !!process.env.CODESPACES;

    if (isCI) {
        console.log('Using Azure CLI Credential in CI environment');
        return new AzureCliCredential();
    }

    const options = { additionallyAllowedTenants: ['*'], ...enableTokenPersistence };
    return isCodespace
        ? new DeviceCodeCredential(options)
        : new ChainedTokenCredential(
              new EnvironmentCredential(options),
              new AzureCliCredential(options),
              new InteractiveBrowserCredential(options),
          );
}

export async function initCredentialDatabase(dbPath: string = ':memory:') {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    await db.exec(
        `CREATE TABLE IF NOT EXISTS credentials (
            id INTEGER PRIMARY KEY,
            username TEXT,
            password TEXT,
            certificate BLOB,
            passphrase TEXT
        );`
    );

    return db;
}

// Example usage:
// const vaultConfig = { name: 'my-keyvault' };
// acquireSecret('my-secret', vaultConfig).then(console.log);
// initCredentialDatabase('./credentials.db');

console.log('Azure Key Vault Manager ready! 🚀');
