const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const url = process.argv[2];

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    extraHTTPHeaders: {
      'Referer': 'https://a8.kora-plus.app/',
      'Origin': 'https://a8.kora-plus.app'
    }
  });

  const page = await context.newPage();

  let m3u8 = null;

  // التقاط كل الطلبات الشبكية
  page.on('response', async (response) => {
    try {
      const resUrl = response.url();

      if (resUrl.includes('.m3u8')) {
        console.log('🎯 FOUND M3U8:', resUrl);
        m3u8 = resUrl;
      }
    } catch (e) {}
  });

  console.log('🚀 Opening page:', url);

  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // انتظار إضافي لتحميل الـ stream
  await page.waitForTimeout(8000);

  await browser.close();

  if (!m3u8) {
    console.log('❌ NO STREAM FOUND');
    process.exit(1);
  }

  fs.writeFileSync('stream.txt', m3u8);
  console.log('✅ Saved:', m3u8);
})();
