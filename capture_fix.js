
import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true, // Use new headless mode if available, or just true
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--hide-scrollbars',
            '--use-gl=swiftshader' // Try software rendering for stability in headless if GPU fails, or just default.
            // Actually, for Three.js in headless, sometimes --use-gl=egl or just default works better. 
            // Let's rely on time first.
        ]
    });
    const page = await browser.newPage();

    // Set a standard desktop viewport
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    try {
        console.log('Navigating to page...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 60000 });

        console.log('Waiting for 3D scene to hydrate (5 seconds)...');
        // Wait for a significant amount of time for Three.js to initialize and render
        await new Promise(r => setTimeout(r, 8000));

        console.log('Capturing screenshot...');
        await page.screenshot({ path: 'assets/landing_preview.webp', type: 'webp', quality: 90 });

        console.log('Screenshot captured successfully.');
    } catch (e) {
        console.error('Error capturing screenshot:', e);
    } finally {
        await browser.close();
    }
})();
