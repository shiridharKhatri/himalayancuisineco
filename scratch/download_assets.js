const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const outputDir = '/Users/lycoris/test/himalayancuisineco/public/images';

const assetsToDownload = [
  { name: 'momo.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/c55baaed-d273-4321-9e9e-363be219d969?w=640&fit=cover' },
  { name: 'dal_bhat.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/3bf8e40a-1633-4ab6-ad9b-8bfd50318203?w=640&fit=cover' },
  { name: 'thukpa.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/69d9cc1e-e09f-4e2c-9acb-23724c7307e9?w=640&fit=cover' },
  { name: 'choila.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/acc62b99-87b0-43bc-a19a-41d90919eeec?w=640&fit=cover' },
  { name: 'kheer.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/8313e1e6-800e-4737-8675-e2cf4695ba3c?w=640&fit=cover' },
  { name: 'lassi.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/919d2855-4fa6-4949-acc0-3ab1e4e96409?w=640&fit=cover' },
  { name: 'story_heritage.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/3b09b5a6-ecfa-47f7-a3f4-cc58f4b1f8ab?w=768&h=768&fit=cover' },
  { name: 'chef_tashi.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/cc5d114b-3e83-453b-bd61-93785b85300a?w=768&h=768&fit=cover' },
  { name: 'chef_mingma.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/7ee9cca0-5934-4955-83a0-5699c6133a8b?w=768&h=768&fit=cover' },
  { name: 'event_dashain.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/7ee9cca0-5934-4955-83a0-5699c6133a8b?w=768&h=768&fit=cover' },
  { name: 'event_masterclass.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/57db6abb-7c3d-47b5-a0ac-a4589f2d10dc?w=768&h=768&fit=cover' },
  { name: 'gift_card.svg', url: 'https://himalayancuisineco.com/images/gift-cards/gift-card.svg' },
  { name: 'happy_birthday.svg', url: 'https://himalayancuisineco.com/images/gift-cards/happy-birthday.svg' },
  { name: 'happy_holidays.svg', url: 'https://himalayancuisineco.com/images/gift-cards/happy-holidays.svg' },
  { name: 'thank_you.svg', url: 'https://himalayancuisineco.com/images/gift-cards/thank-you.svg' },
  { name: 'catering_buffet.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/d6df9d0e-dab2-427a-a742-ac3b9772c25c?w=768&h=768&fit=cover' },
  { name: 'catering_private.jpg', url: 'https://himalayancuisineco.com/pluto-images/funnel/images/471141ca-c372-4d3e-bf0c-856159870ff9?w=768&h=768&fit=cover' },
  { name: 'catering_map.jpg', url: 'https://himalayancuisineco.com/static-maps/map.jpg?lat=39.5505494&lon=-107.326305&styleKey=202504&width=600&height=400&zoomLevel=15' }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Launching Brave Browser...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: false,
    defaultViewport: { width: 800, height: 600 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  
  // Set headers to pass Cloudflare checks
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  // Load a page on the target domain first to establish cookies/sessions
  console.log("Initializing Cloudflare clearance session...");
  await page.goto("https://himalayancuisineco.com/", { waitUntil: 'load', timeout: 30000 });
  await sleep(6000); // Wait for Turnstile to clear

  for (const asset of assetsToDownload) {
    try {
      console.log(`Downloading ${asset.name} from ${asset.url}...`);
      
      const base64Data = await page.evaluate(async (fetchUrl) => {
        try {
          const res = await fetch(fetchUrl);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const blob = await res.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("FileReader failed"));
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          return `ERROR: ${e.message}`;
        }
      }, asset.url);

      if (base64Data.startsWith('ERROR:')) {
        console.error(`Failed to fetch ${asset.name}: ${base64Data}`);
        continue;
      }

      // Parse base64
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        console.error(`Invalid base64 response for ${asset.name}`);
        continue;
      }

      const buffer = Buffer.from(matches[2], 'base64');
      const destPath = path.join(outputDir, asset.name);
      fs.writeFileSync(destPath, buffer);
      console.log(`Saved ${asset.name} successfully to ${destPath} (${buffer.length} bytes).`);
      await sleep(500); // Politeness delay
    } catch (e) {
      console.error(`Error downloading ${asset.name}:`, e);
    }
  }

  await browser.close();
  console.log("All image downloads completed!");
}

run();
