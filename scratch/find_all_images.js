const puppeteer = require('puppeteer-core');

const pages = [
  'https://himalayancuisineco.com/',
  'https://himalayancuisineco.com/menu',
  'https://himalayancuisineco.com/story',
  'https://himalayancuisineco.com/catering',
  'https://himalayancuisineco.com/gift-cards',
  'https://himalayancuisineco.com/careers'
];

async function run() {
  console.log("Launching Brave...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: false,
    defaultViewport: { width: 1280, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const allImages = {};

  for (const url of pages) {
    try {
      console.log(`Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      await new Promise(r => setTimeout(r, 4000)); // wait for lazy loads

      const pageImgs = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img')).map(img => img.src || img.getAttribute('src')).filter(src => src && !src.startsWith('data:'));
        
        const bgs = [];
        Array.from(document.querySelectorAll('*')).forEach(el => {
          const bg = window.getComputedStyle(el).backgroundImage;
          if (bg && bg !== 'none' && bg.startsWith('url(')) {
            const match = bg.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match) bgs.push(match[1]);
          }
        });

        return [...new Set([...imgs, ...bgs])];
      });

      allImages[url] = pageImgs;
      console.log(`Found ${pageImgs.length} images on ${url}`);
    } catch (e) {
      console.error(`Error on ${url}:`, e.message);
    }
  }

  console.log("\nAll Extracted Images:\n", JSON.stringify(allImages, null, 2));
  await browser.close();
}

run();
