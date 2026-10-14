const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE_URL = 'https://test.netlify.app/';
const THANK_YOU_URL = '**/thank-you.html**';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Test data is kept in one place so it can be changed without touching the flow.
// The website field is type="url", so the value must include the protocol.
const lead = {
  name: 'Idan Test',
  email: 'idan.test@example.com',
  phone: '0501234567',
  company: 'Jones QA',
  website: 'https://www.example.com',
  employees: '51-500',
};

// Pass --headed to watch the browser while the flow runs.
const headed = process.argv.includes('--headed');

async function run() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: !headed, slowMo: headed ? 300 : 0 });
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL);
    console.log(`Opened ${BASE_URL}`);

    // The fields have stable ids, which makes them the most reliable locators on this page.
    await page.locator('#name').fill(lead.name);
    await page.locator('#email').fill(lead.email);
    await page.locator('#phone').fill(lead.phone);
    await page.locator('#company').fill(lead.company);
    await page.locator('#website').fill(lead.website);
    console.log('Filled Name, Email, Phone, Company and Website');

    // Bonus: change Number of Employees from 1-10 to 51-500, then confirm the change took effect.
    const employees = page.locator('#employees');
    await employees.selectOption({ label: lead.employees });
    const selected = await employees.inputValue();
    if (selected !== lead.employees) {
      throw new Error(`Number of Employees is "${selected}", expected "${lead.employees}"`);
    }
    console.log(`Changed Number of Employees to ${selected}`);

    // Taken after all the inputs are set, so the screenshot shows exactly what gets submitted.
    const screenshotPath = path.join(SCREENSHOT_DIR, 'before-submit.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot to ${screenshotPath}`);

    await page.getByRole('button', { name: 'Request a call back' }).click();

    // Reaching the URL is not enough on its own, so the heading is checked as well.
    await page.waitForURL(THANK_YOU_URL);
    await page.getByRole('heading', { name: 'Thank You!' }).waitFor();
    console.log(`Reached the thank you page: ${page.url()}`);
  } catch (error) {
    const failurePath = path.join(SCREENSHOT_DIR, 'failure.png');
    await page.screenshot({ path: failurePath, fullPage: true }).catch(() => {});
    console.error(`Automation failed: ${error.message}`);
    console.error(`Saved failure screenshot to ${failurePath}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
