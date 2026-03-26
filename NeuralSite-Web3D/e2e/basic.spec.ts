import { test, expect } from '@playwright/test';

test.describe('NeuralSite E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[Console Error] ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.error(`[Page Error] ${error.message}`);
    });
  });

  test('homepage loads without crash', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for page to be loaded
    await page.waitForLoadState('networkidle');
    
    // Check page title or main content exists
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('no critical console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Filter out expected errors (API not available, favicon, etc)
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('WebGL') &&
      !e.includes('API Error') &&
      !e.includes('net::ERR') &&
      !e.includes('CORS') &&
      !e.includes('localhost:8000')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('can see main UI elements', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if main container exists
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });
});