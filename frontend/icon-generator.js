// const sharp = require('sharp');
// const fs = require('fs');
import sharp from 'sharp';
import fs from 'fs';

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const appleSizes = [57, 72, 76, 114, 120, 144, 152, 180];

async function generateIcons() {
  // Make sure you have a source icon (1024x1024 recommended)
  const sourceIcon = 'source-icon.png';
  
  // Generate regular icons
  for (const size of sizes) {
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`Generated icon-${size}x${size}.png`);
  }
  
  // Generate Apple Touch Icons
  for (const size of appleSizes) {
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(`public/icons/apple-touch-icon-${size}x${size}.png`);
    console.log(`Generated apple-touch-icon-${size}x${size}.png`);
  }
  
  // Generate main Apple Touch Icon (180x180)
  await sharp(sourceIcon)
    .resize(180, 180)
    .png()
    .toFile('public/icons/apple-touch-icon.png');
  
  // Generate favicon
  await sharp(sourceIcon)
    .resize(32, 32)
    .toFormat('ico')
    .toFile('public/favicon.ico');
    
  console.log('All icons generated!');
}

generateIcons()
  .then(() => console.log('Icon generation complete!'))
  .catch(err => console.error('Error generating icons:', err));