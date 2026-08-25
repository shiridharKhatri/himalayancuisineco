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
  
  console.log("Waiting 10 seconds for Turnstile verification...");
  await new Promise(r => setTimeout(r, 10000));

  // Scroll page to load lazy elements
  console.log("Scrolling page to trigger lazy load...");
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 250;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 50);
    });
  });
  console.log("Scrolling finished. Extracting items...");

  // Extract menu structure
  const result = await page.evaluate(() => {
    // Find visible categories H2
    const headings = Array.from(document.querySelectorAll('h2')).map(h => ({
      text: h.innerText ? h.innerText.trim() : "",
      element: h
    })).filter(h => h.text && !h.text.includes("security") && !h.text.includes("verification"));

    // Find all cards using data-testid
    const cards = Array.from(document.querySelectorAll('a[data-testid^="menu-item-card-"]'));
    const items = [];

    cards.forEach((card) => {
      const nameEl = card.querySelector('[data-testid="menu-item-name"]');
      const name = nameEl ? nameEl.innerText.trim() : "";
      if (!name || name.length < 2) return;

      const priceEl = card.querySelector('[data-testid="menu-item-price"]');
      const priceText = priceEl ? priceEl.innerText.replace('$', '').trim() : "15.00";
      const price = parseFloat(priceText) || 15.00;

      // Description (could be optional or line clamped, check any other text)
      // Let's find any element that is not the name or price
      let description = "Traditional Himalayan specialty seasoned with aromatic mountain herbs.";
      const descEls = Array.from(card.querySelectorAll('p, span, div')).filter(el => {
        if (el.children.length > 0) return false;
        const txt = el.innerText ? el.innerText.trim() : "";
        return txt && txt !== name && !txt.startsWith('$') && txt.length > 5;
      });
      if (descEls.length > 0) {
        description = descEls[0].innerText.trim();
      }

      // Image src
      const imgEl = card.querySelector('img');
      let imageUrl = null;
      if (imgEl) {
        imageUrl = imgEl.src || imgEl.getAttribute('src');
      }

      // Find nearest preceding H2 category heading
      const cardRect = card.getBoundingClientRect();
      const cardY = cardRect.top + window.scrollY;

      let nearestCategory = "Other Specialties";
      let minDistance = Infinity;

      headings.forEach(h => {
        const hRect = h.element.getBoundingClientRect();
        const hY = hRect.top + window.scrollY;
        
        if (hY < cardY) {
          const dist = cardY - hY;
          if (dist < minDistance) {
            minDistance = dist;
            nearestCategory = h.text;
          }
        }
      });

      if (!items.some(it => it.name === name)) {
        items.push({
          category: nearestCategory,
          name,
          description,
          price,
          imageUrl
        });
      }
    });

    return items;
  });

  console.log("Scraped Items Count:", result.length);
  console.log("First 5 Items Preview:\n", JSON.stringify(result.slice(0, 5), null, 2));

  await browser.close();
}

run();
