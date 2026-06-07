import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => logs.push(`[ERROR] ${error.message}`));
  page.on('requestfailed', req => logs.push(`[FAIL] ${req.url()} - ${req.failure()?.errorText}`));
  page.on('response', async resp => {
    if (resp.url().includes('/orders/')) {
      const status = resp.status();
      let body = '';
      try { body = await resp.text(); } catch {}
      logs.push(`[API] ${resp.url()} => ${status}: ${body.substring(0, 200)}`);
    }
  });

  await page.goto('http://localhost:5173/login');
  await page.type('input[type="text"]', 'toan_admin_1');
  await page.type('input[type="password"]', '123456');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.goto('http://localhost:5173/admin/orders');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('=== LOGS ===');
  logs.forEach(l => console.log(l));
  
  await browser.close();
})();
