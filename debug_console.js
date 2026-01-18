
import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure().errorText));

    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    } catch (e) {
        console.error('Navigation Error:', e.message);
    } finally {
        await browser.close();
    }
})();
