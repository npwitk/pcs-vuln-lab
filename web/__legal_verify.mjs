import { chromium } from 'playwright';
import fs from 'fs';

const shotDir = '/tmp/legal-verify-shots';
fs.mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

const consoleMessages = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  }
});
page.on('pageerror', (err) => consoleMessages.push(`[pageerror] ${err.message}`));

const results = [];
const log = (n, status, note) => { results.push(`${n}. ${status} — ${note}`); console.log(`${n}. ${status} — ${note}`); };

try {
  // Check 1
  await page.goto('http://localhost:3000/legal/terms-of-service', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Terms of Service', { timeout: 10000 });
  await page.screenshot({ path: `${shotDir}/1-terms-desktop.png`, fullPage: false });
  const sidebarGroups = await page.locator('text=Core Legal Documents').count();
  const policyGroup = await page.locator('text=Policies & Agreements').count();
  const tocHeader = await page.locator('text=On this page').count();
  const lastUpdated = await page.locator('text=/Last updated/').count();
  log(1, (sidebarGroups && policyGroup && tocHeader && lastUpdated) ? 'PASS' : 'FAIL',
    `sidebarGroups=${sidebarGroups} policyGroup=${policyGroup} tocHeader=${tocHeader} lastUpdated=${lastUpdated}`);

  // Check 2
  const tocBefore = await page.locator('aside:has-text("On this page") a').first().getAttribute('style').catch(() => null);
  await page.evaluate(() => window.scrollTo(0, 2500));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shotDir}/2-scrolled.png`, fullPage: false });
  log(2, 'MANUAL-CHECK', 'scrolled to y=2500, screenshot taken for visual comparison — see report');

  // Check 3
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const tocLinks = page.locator('aside a');
  const tocCount = await tocLinks.count();
  if (tocCount > 3) {
    const targetLink = tocLinks.nth(3);
    const targetText = await targetLink.textContent();
    await targetLink.click();
    await page.waitForTimeout(800);
    const scrollY = await page.evaluate(() => window.scrollY);
    log(3, scrollY > 100 ? 'PASS' : 'FAIL', `clicked TOC entry "${targetText}", scrollY after=${scrollY}`);
    await page.screenshot({ path: `${shotDir}/3-toc-click.png`, fullPage: false });
  } else {
    log(3, 'FAIL', `only ${tocCount} TOC links found`);
  }

  // Check 4
  await page.evaluate(() => window.scrollTo(0, 0));
  const refundsLink = page.locator('nav a:has-text("Refunds Policy")');
  await refundsLink.click();
  await page.waitForTimeout(600);
  const url4 = page.url();
  const title4 = await page.locator('h1').first().textContent();
  log(4, (url4.includes('refunds-policy') && title4.includes('Refunds')) ? 'PASS' : 'FAIL', `url=${url4} title="${title4}"`);
  await page.screenshot({ path: `${shotDir}/4-refunds-page.png`, fullPage: false });

  // Check 5
  await page.keyboard.press('/');
  await page.waitForTimeout(300);
  const modalVisible = await page.locator('text=Search Legal Documents').count();
  if (modalVisible) {
    await page.keyboard.type('chargeback');
    await page.waitForTimeout(500);
    const chargebackResult = page.locator('text=/Chargeback/i').first();
    const hasResult = await chargebackResult.count();
    if (hasResult) {
      await page.screenshot({ path: `${shotDir}/5-search-results.png`, fullPage: false });
      await chargebackResult.click();
      await page.waitForTimeout(800);
      const url5 = page.url();
      log(5, url5.includes('refunds-policy') ? 'PASS' : 'FAIL', `search opened via "/", found chargeback result, navigated to ${url5}`);
    } else {
      log(5, 'FAIL', 'search modal opened but no "chargeback" result found');
      await page.screenshot({ path: `${shotDir}/5-search-noresult.png`, fullPage: false });
    }
  } else {
    log(5, 'FAIL', '"/" key did not open the search modal');
  }
  await page.keyboard.press('Escape').catch(() => {});

  // Check 6
  await page.goto('http://localhost:3000/privacy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const url6 = page.url();
  log(6, url6.includes('/legal/privacy-policy') ? 'PASS' : 'FAIL', `landed at ${url6}`);

  // Check 7
  await page.goto('http://localhost:3000/terms', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const url7 = page.url();
  log(7, url7.includes('/legal/terms-of-service') ? 'PASS' : 'FAIL', `landed at ${url7}`);

  // Check 8
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/legal/terms-of-service', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shotDir}/8-mobile.png`, fullPage: false });
  const docsButton = page.locator('button:has-text("Documents")');
  const docsButtonVisible = await docsButton.isVisible().catch(() => false);
  if (docsButtonVisible) {
    await docsButton.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${shotDir}/8-mobile-drawer.png`, fullPage: false });
    const drawerLink = page.locator('text=Cookie Policy').first();
    const drawerLinkVisible = await drawerLink.isVisible().catch(() => false);
    if (drawerLinkVisible) {
      await drawerLink.click();
      await page.waitForTimeout(600);
      const url8 = page.url();
      const drawerStillOpen = await page.locator('text=Cookie Policy').count();
      log(8, url8.includes('cookie-policy') ? 'PASS' : 'PARTIAL', `mobile drawer opened, navigated to ${url8}`);
    } else {
      log(8, 'PARTIAL', 'mobile menu button worked but drawer nav link not found/visible');
    }
  } else {
    log(8, 'FAIL', 'mobile "Documents" menu button not visible at 390px width');
  }

  // Check 9
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://localhost:3000/legal/terms-of-service', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const themeButtons = page.locator('button[aria-label], button[title]');
  // ThemeSwitcher likely uses icon buttons; try common patterns
  let darkToggled = false;
  const moonButton = page.locator('button:has(svg)').filter({ hasText: '' });
  try {
    const allButtons = await page.locator('aside button').all();
    for (const btn of allButtons) {
      const html = await btn.innerHTML();
      if (html.includes('moon') || html.toLowerCase().includes('moon')) {
        await btn.click();
        darkToggled = true;
        break;
      }
    }
    if (!darkToggled && allButtons.length >= 3) {
      // Fallback: theme switcher is often the last group of 3 icon buttons (system/light/dark)
      await allButtons[allButtons.length - 1].click();
      darkToggled = true;
    }
  } catch (e) {}
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shotDir}/9-dark-mode.png`, fullPage: false });
  const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  log(9, darkToggled ? 'PASS-ATTEMPTED' : 'MANUAL-CHECK', `attempted theme toggle click, body bg after=${bgColor} — see screenshot for actual verdict`);

  // Check 10
  log(10, consoleMessages.length === 0 ? 'PASS' : 'REPORT', consoleMessages.length === 0 ? 'no console errors/warnings observed' : `${consoleMessages.length} messages: ${consoleMessages.slice(0, 15).join(' | ')}`);

} catch (err) {
  console.error('SCRIPT ERROR:', err.message);
  await page.screenshot({ path: `${shotDir}/error-state.png`, fullPage: false }).catch(() => {});
} finally {
  await browser.close();
}

console.log('\n--- RESULTS ---');
results.forEach(r => console.log(r));
console.log('\n--- CONSOLE MESSAGES ---');
consoleMessages.forEach(m => console.log(m));
