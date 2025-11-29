// Script para gerar ícones PNG para PWA
// Execute com: node generate-pwa-icons.js
// Requer: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0D9488"/>
  <circle cx="256" cy="256" r="180" fill="white" opacity="0.1"/>
  <g transform="translate(256, 256)">
    <!-- Gift/Loyalty icon -->
    <rect x="-60" y="-60" width="120" height="120" rx="8" fill="none" stroke="white" stroke-width="8"/>
    <line x1="-60" y1="-20" x2="60" y2="-20" stroke="white" stroke-width="8"/>
    <rect x="-20" y="-60" width="40" height="40" fill="white" opacity="0.3"/>
    <path d="M -40 -40 L -60 -20 L -40 0 L 0 -20 Z" fill="white" opacity="0.6"/>
    <path d="M 40 -40 L 60 -20 L 40 0 L 0 -20 Z" fill="white" opacity="0.6"/>
  </g>
</svg>
`;

const sizes = [192, 512];

async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputPath = path.join(__dirname, `icon-${size}x${size}.png`);
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${outputPath}`);
    }
    console.log('✓ All icons generated successfully!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
