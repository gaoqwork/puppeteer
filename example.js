const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.interotc.com.cn/', {waitUtil: 'networkidle2'});
    await page.waitFor(10000);
    await page.setViewport({width: 1200})
    await page.screenshot({path: 'example.png', fullPage: true});
    await browser.close();
})();