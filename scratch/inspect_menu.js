const puppeteer = require('puppeteer-core');

async function run() {
  console.log("Launching Brave...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  console.log("Navigating to menu page...");
  await page.goto("https://himalayancuisineco.com/menu", { waitUntil: 'load', timeout: 30000 });
  await new Promise(r => setTimeout(r, 8000)); // wait for Turnstile

  // Extract outline
  const outline = await page.evaluate(() => {
    // Look at page headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
      tag: h.tagName,
      text: h.innerText ? h.innerText.trim() : "",
      classes: h.className
    }));

    // Find links that might be categories or items
    const possibleCards = Array.from(document.querySelectorAll('[class*="item"], [class*="card"], [class*="product"]')).slice(0, 15).map(el => ({
      tagName: el.tagName,
      className: el.className,
      text: el.innerText ? el.innerText.trim().slice(0, 150) : ""
    }));

    // Find elements containing price currency symbols like "$"
    const prices = Array.from(document.querySelectorAll('*'))
      .filter(el => el.children.length === 0 && el.innerText && el.innerText.trim().startsWith('$'))
      .slice(0, 15)
      .map(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.innerText.trim()
      }));

    return { headings, possibleCards, prices };
  });

  console.log("Outline Results:\n", JSON.stringify(outline, null, 2));
  await browser.close();
}

run();
