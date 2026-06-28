const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const url = process.argv[2];

  const browser = await chromium.launch();
  const page = await browser.newPage();

  let m3u8 = null;

  page.on('response', async (response) => {
    const resUrl = response.url();

    if (resUrl.includes('.m3u8')) {
      m3u8 = resUrl;
      console.log("FOUND:", m3u8);
    }
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  await page.waitForTimeout(8000);

  await browser.close();

  if (!m3u8) {
    console.log("NO STREAM FOUND");
    process.exit(1);
  }

  fs.writeFileSync('stream.txt', m3u8);
})();
