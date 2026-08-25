const puppeteer = require('puppeteer-core');

async function run() {
  console.log("Launching Brave...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: false,
    defaultViewport: { width: 1280, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  console.log("Navigating to live menu...");
  await page.goto("https://himalayancuisineco.com/menu", { waitUntil: 'load', timeout: 45000 });
  await new Promise(r => setTimeout(r, 8000)); // wait for Turnstile

  // Inspect the ancestors of a price element
  const parentTree = await page.evaluate(() => {
    // Find the first element that has no children and has text matching $21.00 or similar
    const priceEl = Array.from(document.querySelectorAll('*'))
      .find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === '$21.00');

    if (!priceEl) return { error: "Could not find a $21.00 price element to trace" };

    const tree = [];
    let current = priceEl;
    for (let i = 0; i < 7; i++) {
      tree.push({
        level: i,
        tagName: current.tagName,
        className: current.className,
        html: current.outerHTML.slice(0, 300), // print start of HTML
        innerText: current.innerText ? current.innerText.slice(0, 120) : ""
      });
      current = current.parentElement;
      if (!current) break;
    }

    return { tree };
  });

  console.log("Trace results:\n", JSON.stringify(parentTree, null, 2));
  await browser.close();
}

run();
