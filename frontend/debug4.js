import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Intercept login
  let token = null;
  page.on('response', async resp => {
    if (resp.url().includes('/auth/') || resp.url().includes('/login')) {
      try {
        const json = await resp.json();
        if (json.token) token = json.token;
        console.log('Auth response:', JSON.stringify(json).substring(0, 200));
      } catch {}
    }
    if (resp.url().includes('/orders/all')) {
      const status = resp.status();
      try {
        const json = await resp.json();
        console.log(`[API /orders/all] => ${status}, items: ${json.length}`);
        if (json.length > 0) {
          console.log('Sample order:', JSON.stringify(json[0]).substring(0, 300));
        }
      } catch {}
    }
  });

  await page.goto('http://localhost:5173/login');
  await new Promise(r => setTimeout(r, 1000));
  
  // Fill login
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].type('toan_admin_1');
    await inputs[1].type('123456');
  }
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Current URL after login:', page.url());
  
  await page.goto('http://localhost:5173/admin/orders');
  await new Promise(r => setTimeout(r, 3000));
  
  // Get the orders table content
  const tableText = await page.evaluate(() => {
    const tbody = document.querySelector('tbody');
    return tbody ? tbody.innerText : 'NO TBODY FOUND';
  });
  console.log('Table content:', tableText.substring(0, 500));
  
  await browser.close();
})();
