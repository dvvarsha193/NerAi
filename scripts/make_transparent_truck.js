import { Jimp } from 'jimp';

async function processTruck() {
  const image = await Jimp.read('public/truck.jpg');
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const data = image.bitmap.data; // Uint8Array RGBA

  console.log(`Dimensions: ${width}x${height}`);

  // Sample corner pixel
  console.log(`Corner color: R=${data[0]}, G=${data[1]}, B=${data[2]}, A=${data[3]}`);

  const visited = new Uint8Array(width * height);
  const queue = [];
  const getIdx = (x, y) => y * width + x;

  function isBackgroundCandidate(x, y) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const diff = maxVal - minVal;

    // Studio background is off-white / light gray with low saturation
    if (minVal > 228 && diff < 18) return true;
    if (minVal > 242) return true;

    return false;
  }

  // Push borders
  for (let x = 0; x < width; x++) {
    if (isBackgroundCandidate(x, 0)) { queue.push(x, 0); visited[getIdx(x, 0)] = 1; }
    if (isBackgroundCandidate(x, height - 1)) { queue.push(x, height - 1); visited[getIdx(x, height - 1)] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isBackgroundCandidate(0, y)) { queue.push(0, y); visited[getIdx(0, y)] = 1; }
    if (isBackgroundCandidate(width - 1, y)) { queue.push(width - 1, y); visited[getIdx(width - 1, y)] = 1; }
  }

  // BFS flood fill
  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const pIdx = getIdx(nx, ny);
        if (!visited[pIdx] && isBackgroundCandidate(nx, ny)) {
          visited[pIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  console.log(`Identified ${queue.length / 2} background pixels out of ${width * height}`);

  // Now set alpha
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = getIdx(x, y);
      const bIdx = pIdx * 4;

      if (visited[pIdx]) {
        data[bIdx + 3] = 0; // Transparent
      } else {
        // Soft shadow underneath tires (near bottom)
        const r = data[bIdx];
        const g = data[bIdx + 1];
        const b = data[bIdx + 2];
        if (y > height * 0.72 && r > 185 && g > 185 && b > 185) {
          const darkness = 255 - ((r + g + b) / 3);
          if (darkness < 65) {
            data[bIdx] = 20;
            data[bIdx + 1] = 25;
            data[bIdx + 2] = 35;
            data[bIdx + 3] = Math.min(255, Math.round(darkness * 2.4));
          }
        }
      }
    }
  }

  await image.write('public/truck.png');
  console.log('Successfully saved transparent truck to public/truck.png');
}

processTruck().catch(err => {
  console.error('Error processing image:', err);
  process.exit(1);
});
