const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_URL = process.argv[2];

(async () => {
    console.log('🚀 STREAM ENGINE STARTED');

    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123 Safari/537.36'
    });

    const page = await context.newPage();

    let foundStream = null;

    // التقاط طلبات m3u8
    page.on('request', (req) => {
        const url = req.url();

        if (url.includes('.m3u8')) {
            console.log('🎥 FOUND STREAM:', url);
            foundStream = url;
        }
    });

    try {
        console.log('🌐 Opening:', TARGET_URL);

        await page.goto(TARGET_URL, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await page.waitForTimeout(5000);

        // محاولة تشغيل الفيديو (اختياري)
        await page.mouse.click(640, 360).catch(() => {});

        await page.waitForTimeout(10000);

        await browser.close();

        if (!foundStream) {
            console.log('❌ NO STREAM FOUND');
            process.exit(1);
        }

        fs.writeFileSync('stream.txt', foundStream);

        console.log('✅ STREAM SAVED:', foundStream);

    } catch (err) {
        console.log('❌ ERROR:', err.message);
        await browser.close();
        process.exit(1);
    }
})();
