import { Page } from '@playwright/test';
import { CartLocators } from '../locators/CartLocators';
import { CartItem } from '../types/ui/CartItem';

export class CartPage {
  constructor(private readonly page: Page) {}

  get pageTitle() { return this.page.locator(CartLocators.pageTitle); }

  cartItemByName(productName: string) {
    return this.page.locator(CartLocators.inventoryName).filter({ hasText: productName });
  }

  async getCartItems(): Promise<Record<string, CartItem>> {
    const rows = this.page.locator(CartLocators.cartItem);
    const count = await rows.count();
    const items: Record<string, CartItem> = {};
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const name = (await row.locator(CartLocators.inventoryName).textContent())?.trim() ?? '';
      items[name] = {
        name,
        description: (await row.locator(CartLocators.itemDescription).textContent())?.trim() ?? '',
        price:       (await row.locator(CartLocators.itemPrice).textContent())?.trim() ?? '',
        quantity:    (await row.locator(CartLocators.itemQuantity).textContent())?.trim() ?? '',
      };
    }
    return items;
  }

  async proceedToCheckout() {
    await this.page.locator(CartLocators.checkoutButton).click();
  }
}
