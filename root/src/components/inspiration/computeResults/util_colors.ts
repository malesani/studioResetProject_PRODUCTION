// utils/color.ts
type RGB = { r: number; g: number; b: number; };
type HSL = { h: number; s: number; l: number; };

// 1) Conversioni RGB <-> HSL
export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h, s, l };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const c = (1 - Math.abs(2*l - 1)) * s;
  const x = c * (1 - Math.abs((h/60) % 2 - 1));
  const m = l - c/2;
  let [r1,g1,b1] = [0,0,0];
  if (h < 60)       [r1,g1,b1] = [c,x,0];
  else if (h < 120) [r1,g1,b1] = [x,c,0];
  else if (h < 180) [r1,g1,b1] = [0,c,x];
  else if (h < 240) [r1,g1,b1] = [0,x,c];
  else if (h < 300) [r1,g1,b1] = [x,0,c];
  else              [r1,g1,b1] = [c,0,x];
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

// 2) Clamp helper
function clamp01(v: number) { return Math.min(1, Math.max(0, v)); }

// 3) Lettura / scrittura HEX
export function hexToRgb(hex: string): RGB {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8)  & 0xff,
    b: num & 0xff
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const to2 = (v: number) => v.toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

/**
 * Aumenta o diminuisce la lightness di un colore HSL **in modo proporzionale**:
 *  - se delta > 0: l += (1 - l) * (delta/100)
 *  - se delta < 0: l += l * (delta/100)
 */
export function adjustColorBrightness(hex: string, delta: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  if (delta > 0) {
    hsl.l = hsl.l + (1 - hsl.l) * (delta / 100);
  } else {
    hsl.l = hsl.l + hsl.l * (delta / 100);
  }
  hsl.l = clamp01(hsl.l);
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Analogamente per la saturation:
 *  - se delta > 0: s += (1 - s) * (delta/100)
 *  - se delta < 0: s += s * (delta/100)
 */
export function adjustColorSaturation(hex: string, delta: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  if (delta > 0) {
    hsl.s = hsl.s + (1 - hsl.s) * (delta / 100);
  } else {
    hsl.s = hsl.s + hsl.s * (delta / 100);
  }
  hsl.s = clamp01(hsl.s);
  return rgbToHex(hslToRgb(hsl));
}