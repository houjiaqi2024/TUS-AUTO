import type { Page } from "@playwright/test";

export type Options = {
    auto?: boolean;
    option?: boolean;
    timeout?: number | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KeyValue = { [key: string]: any };

export type PageConstructor<T> = new (page: Page) => T;

