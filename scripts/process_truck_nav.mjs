import { Jimp } from 'jimp';
import path from 'path';

async function processImage() {
  const inputPath = 'C:\\Users\\laksh\\.gemini\\antigravity-ide\\brain\\dcdab3a4-22e6-4a86-b46b-66c8e9176649\\white_cargo_truck_nav_1789484840538.jpg';
  const outputPath = path.resolve('public', 'white-truck-nav.png');

  console.log('Reading image from:', inputPath);
  const image = await Jimp.read(inputPath);

  // Scan every pixel and make pure white / light background transparent
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    const r = image.bitmap.data[idx + 0];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];

    // If near white background
    if (r > 238 && g > 238 && b > 238) {
      image.bitmap.data[idx + 3] = 0; // Transparent
    } else if (r > 225 && g > 225 && b > 225) {
      // Soft antialiased edge
      const alpha = Math.floor(((255 - ((r + g + b) / 3)) / 30) * 255);
      image.bitmap.data[idx + 3] = Math.max(0, Math.min(255, alpha));
    }
  });

  await image.write(outputPath);
  console.log('Saved transparent white cargo truck to:', outputPath);
}

processImage().catch(console.error);
