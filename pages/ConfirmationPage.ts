import { Page } from '@playwright/test';
import { ConfirmationLocators } from '../locators/ConfirmationLocators';

export class ConfirmationPage {
  constructor(private readonly page: Page) {}

  get pageTitle()          { return this.page.locator(ConfirmationLocators.pageTitle); }
  get confirmationHeader() { return this.page.locator(ConfirmationLocators.confirmationHeader); }
  get confirmationText()   { return this.page.locator(ConfirmationLocators.confirmationText); }
  get backHomeButton()     { return this.page.locator(ConfirmationLocators.backHomeButton); }
}
