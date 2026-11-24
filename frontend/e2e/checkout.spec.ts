import { test, expect } from '@playwright/test';

test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout');
  });

  test('creates an invoice, simulates wallet payment, and displays a receipt', async ({ page }) => {
    // Invoice creation
    await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();

    const amountInput = page.getByLabel(/amount/i);
    await amountInput.fill('25.00');

    const currencySelect = page.getByLabel(/currency/i);
    if (await currencySelect.isVisible().catch(() => false)) {
      await currencySelect.selectOption({ index: 0 });
    }

    const createButton = page.getByRole('button', { name: /create invoice/i });
    await createButton.click();

    // Invoice should be created and visible
    const invoiceSummary = page.getByTestId('invoice-summary');
    await expect(invoiceSummary).toBeVisible({ timeout: 15000 });
    await expect(invoiceSummary).toContainText(/25/);

    // Wallet simulation
    const connectWalletButton = page.getByRole('button', { name: /connect wallet/i });
    if (await connectWalletButton.isVisible().catch(() => false)) {
      await connectWalletButton.click();
    }

    const payButton = page.getByRole('button', { name: /pay with wallet|simulate payment|pay now/i });
    await expect(payButton).toBeVisible({ timeout: 15000 });
    await payButton.click();

    // Receipt display
    const receipt = page.getByTestId('receipt');
    await expect(receipt).toBeVisible({ timeout: 20000 });
    await expect(receipt).toContainText(/paid|success|receipt/i);
  });

  test('shows validation error when amount is missing', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create invoice/i });
    await createButton.click();

    await expect(page.getByText(/amount.*required|enter.*amount/i)).toBeVisible();
  });
});
