import { Page } from '@playwright/test';
import { LoginLocators } from '../locators/LoginLocators';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get usernameInput() { return this.page.locator(LoginLocators.usernameInput); }
  get loginButton()   { return this.page.locator(LoginLocators.loginButton); }
  get errorMessage()  { return this.page.locator(LoginLocators.errorMessage); }

  async navigate() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.page.locator(LoginLocators.usernameInput).fill(username);
    await this.page.locator(LoginLocators.passwordInput).fill(password);
    await this.page.locator(LoginLocators.loginButton).click();
  }
}
