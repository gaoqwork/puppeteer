const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.tracing.start({path: './trace.json'});
    await page.goto('https://www.interotc.com.cn');
    await page.tracing.stop();

    browser.close();
})();