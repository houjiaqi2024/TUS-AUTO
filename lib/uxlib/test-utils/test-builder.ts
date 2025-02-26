type FixtureFunction<T> = (context: any) => Promise<T> | T;

export class TestBuilder {
    private fixtures: Record<string, FixtureFunction<any>> = {};
    private beforeAllHooks: Function[] = [];
    private afterAllHooks: Function[] = [];

    fixture<T>(name: string, fn: FixtureFunction<T>): TestBuilder {
        this.fixtures[name] = fn;
        return this;
    }

    beforeAll(fn: Function): TestBuilder {
        this.beforeAllHooks.push(fn);
        return this;
    }

    afterAll(fn: Function): TestBuilder {
        this.afterAllHooks.push(fn);
        return this;
    }

    async run(testFn: (context: Record<string, any>) => Promise<void>) {
        console.log('🔧 Running beforeAll hooks...');
        for (const hook of this.beforeAllHooks) {
            await hook();
        }

        console.log('🚀 Setting up fixtures...');
        const context: Record<string, any> = {};
        for (const [key, fixtureFn] of Object.entries(this.fixtures)) {
            context[key] = await fixtureFn(context);
        }

        console.log('🧪 Running test...');
        await testFn(context);

        console.log('🧹 Running afterAll hooks...');
        for (const hook of this.afterAllHooks) {
            await hook();
        }
    }
}