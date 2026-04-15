const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('file:///Users/mitchellpretak/Desktop/BoosterBranding/strategy.html', { waitUntil: 'networkidle0' });
  
  // Scroll down a bit
  await page.evaluate(() => {
    window.scrollBy(0, 500);
  });
  
  // Wait a moment for scroll and blur rendering
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: '/Users/mitchellpretak/.gemini/antigravity/brain/36becaaf-910f-4c9d-b68f-ce99cc3647a3/chrome_screenshot.png' });
  
  await browser.close();
  console.log("Screenshot saved.");
})();
