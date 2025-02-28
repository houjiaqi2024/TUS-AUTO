/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FeatureSwitchRecord, FeatureSwitches } from '../common/url';
import { GlobalTimeout } from './timeout';
import { Environment, EnvironmentType } from './environment';
import type { CredentialProvider } from './credential';

/**
 * type definition for e2e project configuration.
 * @see ./schema.json
 */
export interface WorkerConfiguration {
    readonly environment: Readonly<Environment>;
    readonly root: string;
    readonly rootDir: string;
    readonly configDir?: string;
    readonly timeout: GlobalTimeout;
    readonly credentialPattern: string;
}

export interface Configuration {
    readonly target: {
        readonly frontend: string;
        readonly mapLocal?: string;
        readonly featureSwitches: FeatureSwitchRecord;
    };
    readonly manifestOverrides?: Manifest;
    readonly authCache: string | boolean;
    readonly root: string;
    readonly rootDir: string;
    readonly configDir?: string;
    readonly timeout: GlobalTimeout;
    readonly credentialPattern: string;
}

export interface ProjectWorkerArgs {
    environment: EnvironmentType;
    credential: CredentialProvider | CredentialProvider[];
    timeout: Partial<GlobalTimeout>;
    webServers: ReadonlyArray<{
        readonly name: string;
        readonly url: string;
    }>;
}
export interface ProjectTestArgs {
    featureSwitches: Readonly<FeatureSwitchRecord>;
    /** the value will be deeply override with default one by name property */
    manifestOverrides?: Manifest;
    /**
     * path to cache login auth cookies
     * see [storageState](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
     * if provides `true`, will save the cache into '{cache-directory}/.authCache'
     * if provides an absolute file path, will save the cache into that file
     * if provides a relative file, the path will relative to {cache-directory}
     * if provides `false`, will disable auth caching
     * {cache-directory} is calculated by https://www.npmjs.com/package/find-cache-dir
     * @default `:memory:` in CI but `true` in local
     */
    authCache: string | boolean;
}

export interface Manifest {
    extensions?: ExtensionManifest[];
    artifacts?: ArtifactManifest[];
    products?: ProductManifest[];
    tab?: TabManifest[];
    [key: string]: any[] | undefined;
}

interface ExtensionManifest {
    name: string;
    url: string;
}

interface ArtifactManifest {
    name: string;
    routeName: string;
    product: string;
    displayName: string;
    displayNamePlural: string;
    displayNameInSentence: string;
    editor: {
        extensionPath: string;
        path: string;
    };
    [key: string]: any;
}

interface ProductManifest {
    name: string;
    displayName: string;
    icon?: { sprite?: string; name: string };
    favicon: string;
    createExperience?: {
        title?: string;
        description: string;
        cards: any[];
        learnMoreLink?: string;
        hasBanner?: boolean;
    };
    homePage: {
        learningMaterials: any[];
        newSection?: any;
        recommendedArtifactTypes?: string[];
    };
    [key: string]: any;
}

export interface TabManifest {
    /**
     * The type name of the tab
     * For example, "Report", "Notebook" or "DataPipeline". The string does not
     * have to be the same as the artifact type name, as long as it is unique
     * across the tab manifest and can describe the type of the tab.
     */
    name: string;

    /**
     * The icon of the tab
     * For exmaple, { name: 'data_bar_vertical_20_regular' }.
     */
    icon: string;

    /**
     * If is allow, it means that the tab type has completed deep integration with the multitasking framework, which always allows multiple tabs to be
     * open at the same time.
     * If is notAllow, it means that the tab type that are not deeply integration with the multitasking framework will be unpinned from the left navbar after deactivation.
     * If is dependOnFeatureSwitch, it means that the tab type is not fully integrated with the multitasking framework, and it is up to the featureSwitch within the
     * framework to decide whether to open multiple tabs or at most one tab. Even if it opens multiple tabs, expect that to be a "fake" multitasking
     * experience with limitations.
     */
    allowMultipleTabs: 'allow' | 'notAllow' | 'dependOnFeatureSwitch';

    /**
     * If set the allowMultipleTabsFeatureSwitch, it means that the artifact allow multiple tabs by the artifact multitasking feature switch, and the allowMultipleTabs parameter will be disabled.
     */
    allowMultipleTabsFeatureSwitch?: string;

    /*
     * If true, the user is not allowed to open an artifact of the same type in Workspace B without having the artifacts opened in Workspace A closed.
     * If use the enableCrossWorkspaceOpenFeatureSwitch parameter, this parameter will be ignored.
     */
    disableCrossWorkspaceOpen?: boolean;

    /*
     * If set the enableCrossWorkspaceOpenFeatureSwitch, it means that the artifact allow cross workspace open by the artifact feature switch, and the disableCrossWorkspaceOpen parameter will be ignored.
     */
    enableCrossWorkspaceOpenFeatureSwitch?: string;

    /*
     * If set the maxInstanceCount, it means allow users to open the maximum number of instances.
     */
    maxInstanceCount?: number;

    /**
     * ArtifactType contain PowerBiArtifactType & TridentArtifactType
     */
    artifactType?: string;

    /**
     * Item display name. Notice that it's important same as the localization key in item registry file.
     *
     */
    displayName: string;

    /**
     * Item display name plural. Notice that it's important same as the localization key in item registry file.
     *
     */
    displayNamePlural: string;

    /**
     * A method to check whether the current url is of the current tab type.
     * If it is, returns a string that can uniquely identify the tab instance.
     * Otherwise, returns undefined. In order for different urls to map to the
     * same tab instance, getTabId() needs to return the same tab id for these
     * different urls.
     */
    getTabId: (url: string) => string | undefined;
    [key: string]: any;
}

export interface LegacyConfiguration {
    environment: Environment;
    featureSwitches: FeatureSwitchRecord;
    authCache?: string | boolean;
    manifestOverrides?: Manifest;
    timeout?: Partial<GlobalTimeout>;
    credentialFilter?: string;
}
