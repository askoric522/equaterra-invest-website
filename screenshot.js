const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  const oNamaUrl = 'file:///' + path.resolve(__dirname, 'o-nama.html').replace(/\\/g, '/');
  await page.goto(oNamaUrl, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'o-nama.png', fullPage: true });

  // Crop heading
  const headingHandle = await page.$('h2.font-serif.uppercase');
  if (headingHandle) {
    const box = await headingHandle.boundingBox();
    if (box) {
      await page.screenshot({
        path: 'values-heading.png',
        clip: { x: box.x - 10, y: box.y - 10, width: box.width + 20, height: box.height + 20 },
      });
    }
  }

  await browser.close();
  console.log('done');
})();
