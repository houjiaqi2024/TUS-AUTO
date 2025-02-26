import { TestBuilder, LoginPage, Container } from "@test-common";
import { chromium, Browser, Page } from 'playwright';

const test = new TestBuilder();

test
    .beforeAll(async () => {
        console.log('🌍 Global setup');
    })
    .fixture('browser', async () => {
        console.log('🚀 Launching browser...');
        return await chromium.launch({ headless: false });
    })
    .fixture('page', async ({ browser }) => {
        console.log('📄 Opening new page...');
        return await browser.newPage();
    })
    .fixture('container', () => {
        console.log('🔗 Creating service container...');
        return new Container();
    })
    .fixture('loginPage', async ({ page }) => {
        console.log('🔑 Initializing LoginPage...');
        return new LoginPage(page);
    })
    .afterAll(async ({ browser }) => {
        console.log('📴 Closing browser...');
        await browser.close();
    });

test.run(async ({ page, loginPage }) => {
    console.log('🚀 Running test case...');
    await loginPage.navigate('https://example.com/login');
    await loginPage.login('testuser', 'password');
});