// Script para gerar favicon e ícones PNG para PWA a partir do seu logo
// Execute com: node generate-pwa-icons.js
// Requer: npm install sharp

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Se existir um arquivo PNG/SVG do seu logo em public, usamos ele.
// Coloque seu arquivo como 'logo-source.png' ou 'logo-source.svg' em /public
const PUBLIC_DIR = path.dirname(fileURLToPath(import.meta.url));
const pngSource = path.join(PUBLIC_DIR, 'logo-source.png');
const svgSource = path.join(PUBLIC_DIR, 'logo-source.svg');

// Fallback SVG (caso não exista um logo-source)
const fallbackSvg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0D9488"/>
  <circle cx="256" cy="256" r="180" fill="white" opacity="0.1"/>
  <g transform="translate(256, 256)">
    <rect x="-90" y="-60" width="180" height="120" rx="16" fill="#119d90" stroke="#073b3a" stroke-width="8"/>
    <circle cx="-40" cy="-20" r="10" fill="#ffd66b"/>
    <circle cx="-10" cy="-20" r="10" fill="#ffffff" opacity="0.7"/>
    <circle cx="20" cy="-20" r="10" fill="#ffffff" opacity="0.5"/>
    <path d="M 70 -25 L 95 -35 L 90 -10 L 115 0 L 90 10 L 95 35 L 70 25 L 55 45 L 45 15 L 15 5 L 45 -5 L 55 -35 Z" fill="#ffd66b" stroke="#073b3a" stroke-width="4"/>
  </g>
  
</svg>
`;

const pwaSizes = [192, 512];
const extraPngSizes = [32, 48, 64, 180];

async function generateIcons() {
  try {
    const hasPng = fs.existsSync(pngSource);
    const hasSvg = fs.existsSync(svgSource);
    const inputBuffer = hasPng
      ? fs.readFileSync(pngSource)
      : hasSvg
        ? fs.readFileSync(svgSource)
        : Buffer.from(fallbackSvg);

    // PWA icons
    for (const size of pwaSizes) {
      const outputPath = path.join(PUBLIC_DIR, `icon-${size}x${size}.png`);
      await sharp(inputBuffer)
        .resize(size, size, { fit: 'cover' })
        .png({ quality: 90 })
        .toFile(outputPath);
      console.log(`✓ Generated ${outputPath}`);
    }

    // Apple touch icon (180), favicons (32, 48, 64)
    for (const size of extraPngSizes) {
      const outputPath = path.join(PUBLIC_DIR, size === 180 ? 'apple-touch-icon-180x180.png' : `favicon-${size}x${size}.png`);
      await sharp(inputBuffer)
        .resize(size, size, { fit: 'cover' })
        .png({ quality: 90 })
        .toFile(outputPath);
      console.log(`✓ Generated ${outputPath}`);
    }

    // Favicon ICO com 16 e 32
    const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
    const ico16 = await sharp(inputBuffer).resize(16, 16).png().toBuffer();
    const ico32 = await sharp(inputBuffer).resize(32, 32).png().toBuffer();
    // sharp não escreve ICO diretamente; usamos uma lib simples inline
    // Como alternativa simples, salvamos 32x32 e 16x16 PNGs já gerados acima
    // e deixamos o link para PNG, que é suportado pela maioria dos navegadores modernos.
    // Se desejar ICO de verdade, instale 'png-to-ico' e converta:
    //   npm install png-to-ico
    //   const toIco = require('png-to-ico');
    //   const icoBuf = await toIco([path.join(PUBLIC_DIR,'favicon-16x16.png'), path.join(PUBLIC_DIR,'favicon-32x32.png')]);
    //   fs.writeFileSync(icoPath, icoBuf);
    console.log('ℹ️ Pulo a geração automática de ICO puro; use png-to-ico se precisar do .ico.');

    console.log('✓ All icons generated successfully!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
