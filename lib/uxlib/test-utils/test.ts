import {
    test as base,
    expect,
    PlaywrightTestArgs,
    TestFixture,
    TestType,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions,
} from '@playwright/test';
import { PageConstructor } from './types';

function createFixtures<T extends Record<string, PageConstructor<unknown>>>(
    classes: T,
) {
    type P = T[keyof T] extends PageConstructor<infer R> ? R : never;
    const ret = {} as Record<keyof T, TestFixture<P, PlaywrightTestArgs>>;
    for (const [key, cls] of Object.entries(classes)) {
        const fixture: TestFixture<P, PlaywrightTestArgs> = async (
            { page },
            use,
        ) => {
            await use(new cls(page) as P);
        };
        ret[key as keyof T] = fixture;
    }
    return ret;
}