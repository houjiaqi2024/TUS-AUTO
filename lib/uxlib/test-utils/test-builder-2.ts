// 定义 FixtureFunction，带入上下文类型 C
type FixtureFunction<T, C> = (context: C) => Promise<T> | T;

// 泛型参数 C 代表当前的上下文类型，初始为空对象
export class TestBuilder<C extends Record<string, any> = {}> {
    private fixtures: Partial<{ [K in keyof C]: FixtureFunction<C[K], C> }> = {};
    private beforeAllHooks: Array<(context: C) => Promise<void> | void> = [];
    private afterAllHooks: Array<(context: C) => Promise<void> | void> = [];

    /**
     * 注册 fixture，同时扩展 context 的类型。
     * 使用方式：
     *   builder.fixture('data', async (ctx) => { return ... });
     */
    fixture<K extends string, T>(
        name: K,
        fn: FixtureFunction<T, C>
    ): TestBuilder<C & Record<K, T>> {
        // 这里使用类型断言将 fixture 存储到 fixtures 中
        (this.fixtures as any)[name] = fn;
        // 返回新的 builder，其 context 扩展了 { [K]: T }
        return this as unknown as TestBuilder<C & Record<K, T>>;
    }

    /**
     * 注册 beforeAll hook，支持使用当前 context
     */
    beforeAll(fn: (context: C) => Promise<void> | void): TestBuilder<C> {
        this.beforeAllHooks.push(fn);
        return this;
    }

    /**
     * 注册 afterAll hook，支持使用当前 context
     */
    afterAll(fn: (context: C) => Promise<void> | void): TestBuilder<C> {
        this.afterAllHooks.push(fn);
        return this;
    }

    /**
     * 执行测试流程：先运行 beforeAll、初始化 fixture、再运行测试函数，最后运行 afterAll
     */
    async run(testFn: (context: C) => Promise<void>) {
        console.log('🔧 Running beforeAll hooks...');
        // 此处如果有依赖关系，可以考虑先构造一个初始 context 后再执行 hook
        const initContext = {} as C;
        for (const hook of this.beforeAllHooks) {
            await hook(initContext);
        }

        console.log('🚀 Setting up fixtures...');
        // 根据注册顺序逐个执行 fixture，构建最终的 context
        const context = { ...initContext } as C;
        for (const [key, fixtureFn] of Object.entries(this.fixtures)) {
            if (fixtureFn) {
                // 这里允许 fixture 依赖已经注册的 context
                (context as any)[key] = await fixtureFn(context);
            }
        }

        console.log('🧪 Running test...');
        await testFn(context);

        console.log('🧹 Running afterAll hooks...');
        for (const hook of this.afterAllHooks) {
            await hook(context);
        }
    }
}
