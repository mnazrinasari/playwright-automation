import { Page } from '@playwright/test';
import { CheckoutLocators } from '../locators/CheckoutLocators';
import { CartItem } from '../types/ui/CartItem';
import { PriceSummary } from '../types/ui/PriceSummary';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  get pageTitle()    { return this.page.locator(CheckoutLocators.pageTitle); }
  get summaryTotal() { return this.page.locator(CheckoutLocators.summaryTotal); }

  async fillShippingDetails(firstName: string, lastName: string, postalCode: string) {
    await this.page.locator(CheckoutLocators.firstNameInput).fill(firstName);
    await this.page.locator(CheckoutLocators.lastNameInput).fill(lastName);
    await this.page.locator(CheckoutLocators.postalCodeInput).fill(postalCode);
    await this.page.locator(CheckoutLocators.continueButton).click();
  }

  async getOrderItems(): Promise<Record<string, CartItem>> {
    const rows = this.page.locator(CheckoutLocators.cartItem);
    const count = await rows.count();
    const items: Record<string, CartItem> = {};
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const name = (await row.locator(CheckoutLocators.inventoryName).textContent())?.trim() ?? '';
      items[name] = {
        name,
        description: (await row.locator(CheckoutLocators.itemDescription).textContent())?.trim() ?? '',
        price:       (await row.locator(CheckoutLocators.itemPrice).textContent())?.trim() ?? '',
        quantity:    (await row.locator(CheckoutLocators.itemQuantity).textContent())?.trim() ?? '',
      };
    }
    return items;
  }

  async getPriceSummary(): Promise<PriceSummary> {
    return {
      itemTotal: (await this.page.locator(CheckoutLocators.subtotalLabel).textContent())?.trim() ?? '',
      tax:       (await this.page.locator(CheckoutLocators.taxLabel).textContent())?.trim() ?? '',
      total:     (await this.page.locator(CheckoutLocators.summaryTotal).textContent())?.trim() ?? '',
    };
  }

  async completePurchase() {
    await this.page.locator(CheckoutLocators.finishButton).click();
  }
}
