const sharp = require('sharp');

(async () => {
  const input = 'LOGO bez teksta.jpg';
  const image = sharp(input).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  const threshold = 235;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const isBg = r > threshold && g > threshold && b > threshold;
      if (!isBg) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = 6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  // All white pixels (inside and outside) become transparent.
  const outBuf = Buffer.alloc(cropW * cropH * 4);
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcI = ((y + minY) * width + (x + minX)) * channels;
      const dstI = (y * cropW + x) * 4;
      const r = data[srcI], g = data[srcI + 1], b = data[srcI + 2];

      const lightness = (Math.min(r, g, b) + Math.max(r, g, b)) / 2;
      let alpha;
      if (lightness >= threshold) {
        alpha = 0;
      } else if (lightness > 200) {
        alpha = Math.round((1 - (lightness - 200) / (threshold - 200)) * 255);
      } else {
        alpha = 255;
      }

      outBuf[dstI] = r;
      outBuf[dstI + 1] = g;
      outBuf[dstI + 2] = b;
      outBuf[dstI + 3] = alpha;
    }
  }

  await sharp(outBuf, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile('logo.png');

  console.log(`logo.png written: ${cropW}x${cropH}`);
})();
