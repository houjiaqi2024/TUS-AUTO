import { PageConstructor, KeyValue } from './types';

type FixtureFunction<T> = (context: any) => Promise<T> | T;

type FixtureOptions = {
    auto?: boolean;
    timeout?: number;
};

type FixtureScope = 'test' | 'worker';

interface FixtureDefinition<T> {
    fn: FixtureFunction<T>;
    options: FixtureOptions;
    scope: FixtureScope;
}

export class TestBuilder <PT extends KeyValue, PW extends KeyValue>{
    private fixtures: Record<string, FixtureDefinition<any>> = {};
    private beforeAllHooks: Function[] = [];
    private afterAllHooks: Function[] = [];

    /** 创建一个新的 TestBuilder 实例 */
    static create(): TestBuilder {
        return new TestBuilder();
    }

    /** 定义一个 fixture，支持 test/worker 作用域 */
    fixture<T>(
        name: string,
        fn: FixtureFunction<T>,
        options: FixtureOptions = {},
        scope: FixtureScope = 'test',
    ): TestBuilder {
        this.fixtures[name] = { fn, options, scope };
        return this;
    }

    /** 定义 beforeAll 钩子 */
    beforeAll(fn: Function): TestBuilder {
        this.beforeAllHooks.push(fn);
        return this;
    }

    /** 定义 afterAll 钩子 */
    afterAll(fn: Function): TestBuilder {
        this.afterAllHooks.push(fn);
        return this;
    }

    /** 扩展现有的 fixture 集合 */
    extend(newFixtures: Record<string, FixtureDefinition<any>>): TestBuilder {
        this.fixtures = { ...this.fixtures, ...newFixtures };
        return this;
    }

    /** 绑定页面对象 */
    page<K extends string, P>(
        name: K,
        ctr: new (context: any) => P,
    ): TestBuilder {
        return this.fixture(name, async (ctx) => new ctr(ctx.page));
    }

    /** 绑定服务对象 */
    service<K extends string, S>(
        name: K,
        provider: () => S,
    ): TestBuilder {
        return this.fixture(name, async () => provider());
    }

    /** 运行测试 */
    async run(testFn: (context: Record<string, any>) => Promise<void>) {
        console.log('🔧 Running beforeAll hooks...');
        for (const hook of this.beforeAllHooks) {
            await hook();
        }

        console.log('🚀 Setting up fixtures...');
        const context: Record<string, any> = {};
        for (const [key, fixture] of Object.entries(this.fixtures)) {
            console.log(`🔩 Setting up fixture: ${key} (scope: ${fixture.scope})`);
            context[key] = await fixture.fn(context);
        }

        console.log('🧪 Running test...');
        await testFn(context);

        console.log('🧹 Running afterAll hooks...');
        for (const hook of this.afterAllHooks) {
            await hook();
        }
    }
}
