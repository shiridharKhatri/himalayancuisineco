const fs = require('fs');
const path = require('path');
const https = require('https');

const outputDir = '/Users/lycoris/test/himalayancuisineco/public/images';

const unsplashAssets = [
  // Core Dishes
  { name: 'momo.jpg', id: 'photo-1563245372-f21724e3856d' },
  { name: 'dal_bhat.jpg', id: 'photo-1626777552726-4a6b54c97e46' },
  { name: 'thukpa.jpg', id: 'photo-1569718212165-3a8278d5f624' },
  { name: 'choila.jpg', id: 'photo-1601050690597-df056fb4ce78' },
  { name: 'kheer.jpg', id: 'photo-1588741176018-ac14a138430f' },
  { name: 'lassi.jpg', id: 'photo-1553530666-ba11a7da3888' },
  
  // Marketing & Layouts
  { name: 'story_heritage.jpg', id: 'photo-1596790011460-0fb5dfd05dcf' },
  { name: 'chef_tashi.jpg', id: 'photo-1577219491135-ce391730fb2c' },
  { name: 'chef_mingma.jpg', id: 'photo-1583394838336-acd977736f90' },
  { name: 'event_dashain.jpg', id: 'photo-1546833999-b9f581a1996d' },
  { name: 'event_masterclass.jpg', id: 'photo-1556910103-1c02745aae4d' },
  { name: 'catering_buffet.jpg', id: 'photo-1555244162-803834f70033' },
  { name: 'catering_private.jpg', id: 'photo-1414235077428-338989a2e8c0' }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Starting Unsplash high-res assets download...");
  
  for (const asset of unsplashAssets) {
    const downloadUrl = `https://images.unsplash.com/${asset.id}?w=1000&fit=crop&q=85`;
    const destPath = path.join(outputDir, asset.name);
    console.log(`Downloading real image for ${asset.name} (Unsplash ID: ${asset.id})...`);
    
    try {
      await downloadFile(downloadUrl, destPath);
      console.log(`Successfully saved ${asset.name} (${fs.statSync(destPath).size} bytes).`);
    } catch (e) {
      console.error(`Error downloading ${asset.name}:`, e.message);
    }
  }

  console.log("\nCopying generic category overrides for scraped dishes...");
  
  // Scraped items image overrides (copying matching category pictures to item files)
  const scrapedItemCopies = [
    { item: 'item-chicken-butter-masala.jpg', src: 'dal_bhat.jpg' },
    { item: 'item-nepalese-tandoori-chicken.jpg', src: 'dal_bhat.jpg' },
    { item: 'item-vegetable-haandi-biryani.jpg', src: 'dal_bhat.jpg' },
    { item: 'item-chicken-curry.jpg', src: 'dal_bhat.jpg' },
    { item: 'item-chicken-haandi-biryani.jpg', src: 'dal_bhat.jpg' },
    { item: 'item-daal-makhani.jpg', src: 'dal_bhat.jpg' },
    { item: 'item-mixed-vegetable-curry.jpg', src: 'dal_bhat.jpg' },
    
    { item: 'item-fried-momo.jpg', src: 'momo.jpg' },
    
    { item: 'item-himalayan-soup.jpg', src: 'thukpa.jpg' },
    
    { item: 'item-samosa.jpg', src: 'choila.jpg' },
    { item: 'item-jeera-aalu.jpg', src: 'choila.jpg' },
    { item: 'item-vegetable-pakora.jpg', src: 'choila.jpg' },
    { item: 'item-chicken-pakora.jpg', src: 'choila.jpg' },
    
    { item: 'item-carrot-halwa.jpg', src: 'kheer.jpg' },
    { item: 'item-steamed-rice.jpg', src: 'kheer.jpg' } // fallback dessert look
  ];

  for (const mapping of scrapedItemCopies) {
    try {
      const srcPath = path.join(outputDir, mapping.src);
      const destPath = path.join(outputDir, mapping.item);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${mapping.src} to ${mapping.item}`);
    } catch (e) {
      console.error(`Error copying ${mapping.item}:`, e.message);
    }
  }

  console.log("\nUnsplash assets downloads and copies successfully completed!");
}

run();
