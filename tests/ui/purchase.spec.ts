import { test, expect } from '../../fixtures/fixtures';
import credentials from '../../test-data/ui/credentials.json';
import customer from '../../test-data/ui/customer.json';
import products from '../../test-data/ui/products.json';
import { URLs } from '../../constants/ui/urls';
import { PageTitles } from '../../constants/ui/pageTitles';
import { Messages } from '../../constants/ui/messages';
import { CartItem } from '../../types/ui/CartItem';
import { parsePrice, computeExpectedItemTotal } from '../../utils/ui/priceUtils';
import { annotate } from '../../utils/shared/annotate';

test.describe('Swag Labs - End-to-End Purchase Flow', () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page, loginPage }) => {
    await test.step('Navigate and log in', async () => {
      await loginPage.navigate();
      await loginPage.login(credentials.username, credentials.password);
    });
  });

  test('TC001-Purchase - Verify complete a full purchase from login to order confirmation', { tag: ['@e2e'] }, async ({
    page,
    productsPage,
    cartPage,
    checkoutPage,
    confirmationPage,
  }) => {
    let capturedFromPDP: Record<string, CartItem> = {};

    await test.step('Verify the products page loads', async () => {
      await expect(page).toHaveURL(URLs.inventory);
      await expect(productsPage.pageTitle).toHaveText(PageTitles.products);
    });

    await test.step(`Add products to cart: ${products.itemsToAdd.join(', ')}`, async () => {
      capturedFromPDP = await productsPage.captureAndAddToCart(products.itemsToAdd);
      await expect(productsPage.cartBadge).toHaveText(String(products.itemsToAdd.length));
      for (const name of products.itemsToAdd) {
        await expect(productsPage.removeButtonFor(name)).toBeVisible();
      }
      annotate('Captured from PDP', capturedFromPDP);
    });

    await test.step('Open the cart and verify added items are consistent with PDP details', async () => {
      await productsPage.goToCart();
      await expect(page).toHaveURL(URLs.cart);
      await expect(cartPage.pageTitle).toHaveText(PageTitles.cart);

      const cartItems = await cartPage.getCartItems();
      expect(cartItems).toEqual(capturedFromPDP);
      annotate('Cart items', cartItems);

      for (const name of products.itemsToAdd) {
        await expect(cartPage.cartItemByName(name)).toBeVisible();
      }
    });

    await test.step('Proceed to checkout and fill in shipping details', async () => {
      await cartPage.proceedToCheckout();
      await expect(page).toHaveURL(URLs.checkoutStepOne);
      await expect(checkoutPage.pageTitle).toHaveText(PageTitles.checkoutStepOne);
      await checkoutPage.fillShippingDetails(
        customer.firstName,
        customer.lastName,
        customer.postalCode,
      );
    });

    await test.step('Verify order overview items and price totals are consistent', async () => {
      await expect(page).toHaveURL(URLs.checkoutStepTwo);
      await expect(checkoutPage.pageTitle).toHaveText(PageTitles.checkoutStepTwo);

      const overviewItems = await checkoutPage.getOrderItems();
      const priceSummary = await checkoutPage.getPriceSummary();

      const displayedItemTotal = parsePrice(priceSummary.itemTotal);
      const displayedTax = parsePrice(priceSummary.tax);
      const displayedTotal = parsePrice(priceSummary.total);

      expect(overviewItems).toEqual(capturedFromPDP);
      expect(displayedItemTotal).toBe(computeExpectedItemTotal(capturedFromPDP));
      expect(displayedTotal).toBe(displayedItemTotal + displayedTax);

      annotate('Order overview items', overviewItems);
      annotate('Price summary', priceSummary);
    });

    await test.step('Complete the purchase and validate the order confirmation message', async () => {
      await checkoutPage.completePurchase();
      await expect(page).toHaveURL(URLs.confirmation);
      await expect(confirmationPage.pageTitle).toHaveText(PageTitles.confirmation);
      await expect(confirmationPage.confirmationHeader).toHaveText(Messages.confirmationHeader);
      await expect(confirmationPage.confirmationText).toContainText(Messages.confirmationText);
      await expect(confirmationPage.backHomeButton).toBeVisible();
    });
  });
});
