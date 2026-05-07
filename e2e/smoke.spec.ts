import { expect, test } from '@playwright/test'

test('renders the landscape scene', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('main', {
      name: 'Minimal black and white ukiyo-e landscape',
    }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Get me to Edo' })).toBeVisible()
})
