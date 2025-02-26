import { Page, chromium } from 'playwright';

export class BasePage {
    constructor(protected page: Page) {}

    async navigate(url: string) {
        await this.page.goto(url);
    }
}

export class LoginPage extends BasePage {
    async login(username: string, password: string) {
        await this.page.fill('#username', username);
        await this.page.fill('#password', password);
        await this.page.click('#login-button');
    }
}
