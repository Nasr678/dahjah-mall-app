import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();

// Official SVG Badge from DajjahLogo
const officialSvg = `<svg viewBox="0 0 400 400" width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF1B8" />
      <stop offset="25%" stop-color="#DFB248" />
      <stop offset="50%" stop-color="#9B6F17" />
      <stop offset="75%" stop-color="#F5D061" />
      <stop offset="100%" stop-color="#B38022" />
    </linearGradient>
    <linearGradient id="goldInnerRing" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ECC85A" />
      <stop offset="50%" stop-color="#8C6010" />
      <stop offset="100%" stop-color="#FCE38A" />
    </linearGradient>
    <linearGradient id="silkGoldGrad" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#FFF4D0" />
      <stop offset="25%" stop-color="#DFB44B" />
      <stop offset="50%" stop-color="#A4791E" />
      <stop offset="75%" stop-color="#ECC359" />
      <stop offset="100%" stop-color="#8A5F12" />
    </linearGradient>
    <linearGradient id="nGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF6D6" />
      <stop offset="30%" stop-color="#E4BA4E" />
      <stop offset="70%" stop-color="#B58420" />
      <stop offset="100%" stop-color="#885E0E" />
    </linearGradient>
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7E249E" />
      <stop offset="50%" stop-color="#551978" />
      <stop offset="100%" stop-color="#370D52" />
    </linearGradient>
    <linearGradient id="purpleDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6C1E89" />
      <stop offset="50%" stop-color="#4A1368" />
      <stop offset="100%" stop-color="#2E0A44" />
    </linearGradient>
  </defs>

  <!-- White Circular Medallion Background -->
  <circle cx="200" cy="200" r="185" fill="#FFFFFF" />

  <!-- Golden Outer Bezel -->
  <circle cx="200" cy="200" r="185" fill="none" stroke="url(#goldRingGrad)" stroke-width="10" />
  <circle cx="200" cy="200" r="179" fill="none" stroke="url(#goldInnerRing)" stroke-width="2.5" opacity="0.8" />

  <!-- Coat Hanger with Collar Silhouette (Dark Charcoal) -->
  <g id="hangerGroup" transform="translate(0, -6)">
    <path d="M200,105 C190,105 186,95 186,88 C186,76 195,68 206,68 C218,68 226,77 224,89 C223,97 217,102 208,107 L208,124" fill="none" stroke="#222026" stroke-width="6" stroke-linecap="round" />
    <path d="M178,138 L200,165 L222,138 L208,125 L192,125 Z" fill="#25232A" />
    <path d="M178,138 L200,160 L188,162 Z" fill="#19171D" />
    <path d="M222,138 L200,160 L212,162 Z" fill="#19171D" />
    <path d="M112,165 C145,150 170,140 188,132 L200,132 L212,132 C230,140 255,150 288,165 C291,166 290,170 286,169 C255,155 230,146 214,139 L186,139 C170,146 145,155 114,169 C110,170 109,166 112,165 Z" fill="#25232A" />
  </g>

  <!-- Flowing Golden Silk Curtain (Left Shoulder & Swirl Under NMS) -->
  <g id="goldenSilk">
    <path d="M142,154 C132,168 118,188 95,202 C92,204 88,214 96,218 C115,226 128,215 136,198 C144,182 147,166 142,154 Z" fill="url(#silkGoldGrad)" />
    <path d="M93,205 C85,212 87,222 97,225 C108,228 118,223 124,216 C129,210 134,198 136,186 C124,195 106,200 93,205 Z" fill="url(#silkGoldGrad)" />
    <path d="M114,194 C120,205 125,217 127,222 C129,220 133,212 134,204 C130,196 122,192 114,194 Z" fill="#7A530E" opacity="0.6" />
    <path d="M136,198 C160,185 200,160 250,210 C275,235 230,248 185,248 C148,248 162,238 188,235 C230,230 255,218 240,200 C215,170 170,180 136,198 Z" fill="url(#silkGoldGrad)" />
  </g>

  <!-- Luxury Stylized Brand Letters N M S -->
  <g id="lettersNMS">
    <circle cx="258" cy="168" r="4.5" fill="url(#goldRingGrad)" />
    <circle cx="272" cy="168" r="4.5" fill="url(#goldRingGrad)" />
    <path d="M152,172 L172,172 L198,220 L198,172 L216,172 L216,242 L196,242 L170,194 L170,242 L152,242 Z" fill="url(#nGoldGrad)" />
    <path d="M152,172 L172,172 L198,220 L198,172" fill="none" stroke="#FFF8E0" stroke-width="1.5" opacity="0.8" />
    <path d="M218,172 L242,172 L260,215 L278,172 L302,172 L302,242 L285,242 L285,198 L268,238 L252,238 L235,198 L235,242 L218,242 Z" fill="url(#purpleGrad)" />
    <path d="M312,230 C312,238 320,244 332,244 C344,244 352,238 352,229 C352,221 346,216 334,213 L325,210 C312,207 304,198 304,188 C304,176 316,168 331,168 C345,168 356,175 357,188 L340,188 C339,182 334,179 328,179 C322,179 318,182 318,187 C318,193 323,196 333,198 L342,201 C357,205 366,214 366,227 C366,241 352,252 332,252 C314,252 300,242 300,230 Z" fill="url(#purpleDarkGrad)" />
  </g>

  <!-- Arabic Brand Subtitle -->
  <text x="200" y="282" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="24" fill="#52146E">ضجة مول للتخفيضات</text>
  <text x="200" y="306" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="800" font-size="13" fill="#6B1D4E" letter-spacing="1.5">MALL BUZZ FOR DISCOUNTS</text>
</svg>`;

// Foreground with safe zone padding for adaptive icons (center 66% viewport)
const foregroundSvg = `<svg viewBox="0 0 432 432" width="432" height="432" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(66, 66) scale(0.75)">
    ${officialSvg.replace(/<svg[^>]*>|<\/svg>/g, '')}
  </g>
</svg>`;

const tmpDir = '/tmp/dajjah_brand';
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const logoSvgPath = path.join(tmpDir, 'official_logo.svg');
const fgSvgPath = path.join(tmpDir, 'foreground_logo.svg');

fs.writeFileSync(logoSvgPath, officialSvg);
fs.writeFileSync(fgSvgPath, foregroundSvg);

const mipmapConfigs = [
  { folder: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
];

console.log('Generating Android Launcher Icons...');
for (const config of mipmapConfigs) {
  const dir = path.join(root, 'android', 'app', 'src', 'main', 'res', config.folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const iconPath = path.join(dir, 'ic_launcher.png');
  const roundPath = path.join(dir, 'ic_launcher_round.png');
  const fgPath = path.join(dir, 'ic_launcher_foreground.png');

  execSync(`ffmpeg -y -i "${logoSvgPath}" -vf "scale=${config.iconSize}:${config.iconSize}:flags=lanczos" "${iconPath}"`, { stdio: 'ignore' });
  execSync(`ffmpeg -y -i "${logoSvgPath}" -vf "scale=${config.iconSize}:${config.iconSize}:flags=lanczos" "${roundPath}"`, { stdio: 'ignore' });
  execSync(`ffmpeg -y -i "${fgSvgPath}" -vf "scale=${config.fgSize}:${config.fgSize}:flags=lanczos" "${fgPath}"`, { stdio: 'ignore' });

  console.log(`✓ ${config.folder}: ic_launcher (${config.iconSize}px), fg (${config.fgSize}px)`);
}

// Update ic_launcher_background.xml
const bgVectorPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'drawable', 'ic_launcher_background.xml');
const bgVectorContent = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportHeight="108"
    android:viewportWidth="108">
    <path
        android:fillColor="#07060A"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`;
fs.writeFileSync(bgVectorPath, bgVectorContent);

const bgValPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'values', 'ic_launcher_background.xml');
const bgValContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#07060A</color>
</resources>
`;
fs.writeFileSync(bgValPath, bgValContent);

// Remove or neutralise generic robot in drawable-v24/ic_launcher_foreground.xml
const v24FgPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'drawable-v24', 'ic_launcher_foreground.xml');
if (fs.existsSync(v24FgPath)) {
  fs.unlinkSync(v24FgPath);
  console.log('✓ Neutralized generic robot in drawable-v24/ic_launcher_foreground.xml');
}

// Generate Splash Screens for all orientations and densities
const splashConfigs = [
  { folder: 'drawable', w: 480, h: 320 },
  { folder: 'drawable-land-mdpi', w: 480, h: 320 },
  { folder: 'drawable-land-hdpi', w: 800, h: 480 },
  { folder: 'drawable-land-xhdpi', w: 1280, h: 720 },
  { folder: 'drawable-land-xxhdpi', w: 1600, h: 960 },
  { folder: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
  { folder: 'drawable-port-mdpi', w: 320, h: 480 },
  { folder: 'drawable-port-hdpi', w: 480, h: 800 },
  { folder: 'drawable-port-xhdpi', w: 720, h: 1280 },
  { folder: 'drawable-port-xxhdpi', w: 960, h: 1600 },
  { folder: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
];

console.log('Generating Splash Screens with Official Brand Emblem...');
for (const sc of splashConfigs) {
  const dir = path.join(root, 'android', 'app', 'src', 'main', 'res', sc.folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const splashPath = path.join(dir, 'splash.png');
  const logoDimension = Math.min(sc.w, sc.h) * 0.45;

  // Render Splash SVG with centered badge and Royal Dark Background #07060A
  const splashSvg = `<svg width="${sc.w}" height="${sc.h}" viewBox="0 0 ${sc.w} ${sc.h}" xmlns="http://www.w3.org/2000/svg">
    <!-- Deep Royal Dark Background -->
    <rect width="${sc.w}" height="${sc.h}" fill="#07060A" />

    <!-- Subtle Radial Glow behind emblem -->
    <defs>
      <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.18" />
        <stop offset="60%" stop-color="#1E1B4B" stop-opacity="0.10" />
        <stop offset="100%" stop-color="#07060A" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="${sc.w / 2}" cy="${sc.h / 2}" r="${logoDimension * 0.9}" fill="url(#centerGlow)" />

    <!-- Centered Official Dajjah Mall Badge -->
    <g transform="translate(${(sc.w - logoDimension) / 2}, ${(sc.h - logoDimension) / 2}) scale(${logoDimension / 400})">
      ${officialSvg.replace(/<svg[^>]*>|<\/svg>/g, '')}
    </g>
  </svg>`;

  const splashSvgPath = path.join(tmpDir, `splash_${sc.folder}.svg`);
  fs.writeFileSync(splashSvgPath, splashSvg);
  execSync(`ffmpeg -y -i "${splashSvgPath}" "${splashPath}"`, { stdio: 'ignore' });
  console.log(`✓ ${sc.folder}/splash.png (${sc.w}x${sc.h})`);
}

console.log('Brand assets generation finished successfully!');
