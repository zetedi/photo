/**
 * Refraction maps for glass surfaces.
 *
 * Each surface is modelled as a slab of glass whose rim curves down like a
 * squircle. A ray looking straight through the slab is bent by Snell's law
 * wherever the surface is tilted, so it lands somewhere else on the content
 * behind. That offset is baked into a displacement map that an SVG
 * <feDisplacementMap> applies to the backdrop. A second map holds the
 * specular rim highlight.
 */

export interface GlassShape {
  /** Corner radius in CSS pixels (clamped to a pill). */
  radius: number;
  /** Width of the curved rim in CSS pixels. */
  bezel: number;
  /** Glass thickness relative to the bezel; higher bends light further. */
  depth?: number;
  /** Index of refraction. */
  ior?: number;
}

export interface GlassMaps {
  width: number;
  height: number;
  displacement: string;
  specular: string;
  /** Pass as `scale` to feDisplacementMap. */
  scale: number;
}

/** Engines that render SVG filters inside `backdrop-filter`. */
export const canRefract = (() => {
  if (typeof navigator === 'undefined' || typeof matchMedia === 'undefined') return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  const chromium = !!brands?.some((b) => b.brand === 'Chromium');
  return chromium && matchMedia('(hover: hover) and (pointer: fine)').matches;
})();

/** Convex squircle profile: 0 at the outer edge, 1 where the rim meets the flat top. */
const height = (x: number) => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

/** Signed distance to a rounded rectangle centred on the origin (negative inside). */
function roundedRect(px: number, py: number, hw: number, hh: number, r: number) {
  const qx = Math.abs(px) - hw + r;
  const qy = Math.abs(py) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

export function createGlassMaps(width: number, height_: number, shape: GlassShape): GlassMaps {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height_));
  const r = Math.min(shape.radius, w / 2, h / 2);
  const bezel = Math.max(2, Math.min(shape.bezel, r || shape.bezel, w / 2, h / 2));
  const thickness = bezel * (shape.depth ?? 1);
  const ior = shape.ior ?? 1.5;
  const hw = w / 2;
  const hh = h / 2;

  // Pass 1: displacement magnitude and direction per pixel.
  const dx = new Float32Array(w * h);
  const dy = new Float32Array(w * h);
  const spec = new Float32Array(w * h);
  let max = 0;
  const light = { x: -0.5, y: -0.866 };
  const e = 0.5;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const sd = roundedRect(px, py, hw, hh, r);
      const inside = -sd;
      if (inside < 0 || inside >= bezel) continue;

      // Outward surface normal in the plane, from the distance field gradient.
      let nx = roundedRect(px + e, py, hw, hh, r) - roundedRect(px - e, py, hw, hh, r);
      let ny = roundedRect(px, py + e, hw, hh, r) - roundedRect(px, py - e, hw, hh, r);
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl;
      ny /= nl;

      // Surface slope across the rim, then the refracted ray's deviation.
      const t = inside / bezel;
      const step = 1e-3;
      const slope = ((height(Math.min(1, t + step)) - height(Math.max(0, t - step))) / (2 * step)) * (thickness / bezel);
      const incidence = Math.atan(slope);
      const refracted = Math.asin(Math.sin(incidence) / ior);
      const travel = height(t) * thickness + thickness * 0.35;
      const shift = Math.tan(incidence - refracted) * travel;

      const i = y * w + x;
      dx[i] = -nx * shift;
      dy[i] = -ny * shift;
      max = Math.max(max, shift);

      // Specular: a fine rim line, brightest where the edge faces the light,
      // with a fainter echo on the opposite side where light exits the glass.
      const facing = nx * light.x + ny * light.y;
      const rim = Math.exp(-inside / 1.1);
      const sheen = Math.pow(1 - t, 3);
      spec[i] = Math.min(
        1,
        rim * (0.22 + 0.7 * Math.pow(Math.max(facing, 0), 1.5) + 0.3 * Math.max(-facing, 0)) +
          sheen * 0.16 * Math.pow(Math.max(facing, 0), 2),
      );
    }
  }

  max = Math.max(max, 1e-3);

  // Pass 2: encode. feDisplacementMap reads (channel / 255 - 0.5) * scale.
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const disp = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    disp.data[i * 4] = Math.round(128 + (dx[i] / max) * 127);
    disp.data[i * 4 + 1] = Math.round(128 + (dy[i] / max) * 127);
    disp.data[i * 4 + 2] = 128;
    disp.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(disp, 0, 0);
  const displacement = canvas.toDataURL();

  const hi = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    hi.data[i * 4] = hi.data[i * 4 + 1] = hi.data[i * 4 + 2] = 255;
    hi.data[i * 4 + 3] = Math.round(spec[i] * 255);
  }
  ctx.putImageData(hi, 0, 0);
  const specular = canvas.toDataURL();

  return { width: w, height: h, displacement, specular, scale: max * 2 };
}
