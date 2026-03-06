import { Page } from '@playwright/test';
import { ProductsLocators } from '../locators/ProductsLocators';
import { CartItem } from '../types/ui/CartItem';

export class ProductsPage {
  constructor(private readonly page: Page) {}

  get pageTitle() { return this.page.locator(ProductsLocators.pageTitle); }
  get cartBadge() { return this.page.locator(ProductsLocators.cartBadge); }

  removeButtonFor(productName: string) {
    return this.page
      .locator(ProductsLocators.inventoryItem)
      .filter({ hasText: productName })
      .locator(ProductsLocators.removeButton);
  }

  /**
   * Captures name, description, price from the inventory card for each product,
   * then clicks Add to cart. Returns a Record keyed by product name.
   */
  async captureAndAddToCart(productNames: string[]): Promise<Record<string, CartItem>> {
    const captured: Record<string, CartItem> = {};
    for (const name of productNames) {
      const card = this.page.locator(ProductsLocators.inventoryItem).filter({ hasText: name });
      captured[name] = {
        name,
        description: (await card.locator(ProductsLocators.inventoryDescription).textContent())?.trim() ?? '',
        price:       (await card.locator(ProductsLocators.inventoryPrice).textContent())?.trim() ?? '',
        quantity:    '1',
      };
      await card.locator(ProductsLocators.addToCartButton).click();
    }
    return captured;
  }

  async goToCart() {
    await this.page.locator(ProductsLocators.cartIcon).click();
  }
}
