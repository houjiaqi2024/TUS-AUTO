export class Container {
    private services = new Map<string, any>();

    register<T>(name: string, instance: T) {
        this.services.set(name, instance);
    }

    resolve<T>(name: string): T {
        if (!this.services.has(name)) {
            throw new Error(`Service ${name} not found`);
        }
        return this.services.get(name);
    }
}
