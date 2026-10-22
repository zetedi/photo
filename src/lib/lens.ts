/**
 * A WebGL loupe: a hemispherical glass dome resting on a photograph.
 *
 * For every pixel under the dome the shader traces a ray straight down,
 * refracts it at the curved surface (Snell's law) and follows it through the
 * glass to the print below. Each colour channel uses a slightly different
 * index of refraction, so the rim shows real dispersion fringes. Fresnel
 * reflection, a specular highlight and a soft cast shadow finish the object.
 *
 * The canvas only covers the lens itself and is moved around with a CSS
 * transform, so the fragment cost stays tiny.
 */

const VERTEX = /* glsl */ `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_img;      // texture size in pixels
uniform vec2 u_host;     // size of the box the photo is laid out in (CSS px)
uniform vec2 u_origin;   // canvas top-left inside that box (CSS px)
uniform vec2 u_size;     // canvas size (CSS px)
uniform vec2 u_center;   // lens centre inside the box (CSS px)
uniform float u_radius;  // lens radius (CSS px)
uniform float u_cover;   // 1 = object-fit: cover, 0 = fill
uniform float u_alpha;

const float BASE = 0.3;                      // flat glass under the dome, in radii
const vec3 IOR = vec3(1.513, 1.52, 1.533);   // R, G, B — crown glass, dispersion nudged up a little
const vec2 LIGHT = vec2(-0.5, -0.8);         // light from the upper left

vec2 photoUV(vec2 p) {
  vec2 uv = p / u_host;
  if (u_cover > 0.5) {
    float host = u_host.x / u_host.y;
    float img = u_img.x / u_img.y;
    vec2 s = host > img ? vec2(1.0, img / host) : vec2(host / img, 1.0);
    uv = (uv - 0.5) * s + 0.5;
  }
  return clamp(uv, 0.0, 1.0);
}

// Lateral travel (in radii) of a vertical ray refracted at height sinA on the dome.
float shift(float sinA, float cosA, float n) {
  float sinB = sinA / n;
  float cosB = sqrt(1.0 - sinB * sinB);
  float tanDev = (sinA * cosB - cosA * sinB) / (cosA * cosB + sinA * sinB);
  return (cosA + BASE) * tanDev;
}

void main() {
  vec2 p = u_origin + v_uv * u_size;
  vec2 d = (p - u_center) / u_radius;
  float r = length(d);
  float aa = 1.25 / u_radius;
  float mask = 1.0 - smoothstep(1.0 - aa, 1.0, r);

  // Soft shadow cast down and to the right, plus contact shade at the rim.
  float sr = length(d - vec2(0.09, 0.15));
  float shadow = (1.0 - smoothstep(0.7, 1.38, sr)) * 0.34
               + (1.0 - smoothstep(1.0, 1.06, r)) * 0.2;

  vec3 col = vec3(0.0);
  if (mask > 0.0) {
    float sinA = min(r, 0.9995);
    float cosA = sqrt(1.0 - sinA * sinA);
    vec2 dir = r > 1e-5 ? d / r : vec2(0.0);

    vec3 s = vec3(shift(sinA, cosA, IOR.r), shift(sinA, cosA, IOR.g), shift(sinA, cosA, IOR.b));
    col.r = texture2D(u_tex, photoUV(p - dir * s.r * u_radius)).r;
    col.g = texture2D(u_tex, photoUV(p - dir * s.g * u_radius)).g;
    col.b = texture2D(u_tex, photoUV(p - dir * s.b * u_radius)).b;

    vec3 n = vec3(dir * sinA, cosA);
    vec2 l2 = normalize(LIGHT);
    float facing = dot(dir, l2);
    vec3 h = normalize(normalize(vec3(LIGHT, 1.35)) + vec3(0.0, 0.0, 1.0));
    float nh = max(dot(n, h), 0.0);

    float fresnel = 0.04 + 0.96 * pow(1.0 - cosA, 5.0);
    vec3 env = vec3(mix(0.08, 1.0, 0.5 + 0.5 * facing));

    col *= 0.975;                                             // transmission loss
    col = mix(col, env, fresnel * 0.38);                      // reflection at grazing angles
    col *= 1.0 - 0.2 * smoothstep(0.82, 1.0, r) * (0.5 - 0.5 * facing);
    col += pow(nh, 200.0) * 0.5 + pow(nh, 22.0) * 0.06;      // highlight
    col += smoothstep(0.95, 0.995, r) * max(facing, 0.0) * 0.42;   // lit rim
    col += smoothstep(0.965, 0.998, r) * max(-facing, 0.0) * 0.12; // light leaving the far rim
  }

  float alpha = mask + shadow * (1.0 - mask);
  gl_FragColor = vec4(col * mask, alpha) * u_alpha;
}`;

export interface LensFrame {
  host: [number, number];
  origin: [number, number];
  size: [number, number];
  center: [number, number];
  radius: number;
  cover: boolean;
  alpha: number;
}

type Uniform =
  | 'u_tex'
  | 'u_img'
  | 'u_host'
  | 'u_origin'
  | 'u_size'
  | 'u_center'
  | 'u_radius'
  | 'u_cover'
  | 'u_alpha';

export class LensRenderer {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private texture: WebGLTexture | null = null;
  private uniforms = {} as Record<Uniform, WebGLUniformLocation | null>;
  private imageSize: [number, number] = [1, 1];

  static create(canvas: HTMLCanvasElement): LensRenderer | null {
    const options: WebGLContextAttributes = {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    };
    const gl = canvas.getContext('webgl2', options) ?? canvas.getContext('webgl', options);
    if (!gl) return null;
    try {
      return new LensRenderer(gl);
    } catch (error) {
      console.warn('Lens unavailable:', error);
      return null;
    }
  }

  private constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link');
    this.program = program;
    gl.useProgram(program);

    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    for (const name of ['u_tex', 'u_img', 'u_host', 'u_origin', 'u_size', 'u_center', 'u_radius', 'u_cover', 'u_alpha'] as const) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
  }

  setImage(image: HTMLImageElement) {
    const gl = this.gl;
    if (this.texture) gl.deleteTexture(this.texture);
    this.texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    if (webgl2) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, webgl2 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.imageSize = [image.naturalWidth, image.naturalHeight];
  }

  render(frame: LensFrame) {
    const gl = this.gl;
    const u = this.uniforms;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!this.texture || frame.alpha < 0.001) return;
    gl.uniform1i(u.u_tex, 0);
    gl.uniform2f(u.u_img, ...this.imageSize);
    gl.uniform2f(u.u_host, ...frame.host);
    gl.uniform2f(u.u_origin, ...frame.origin);
    gl.uniform2f(u.u_size, ...frame.size);
    gl.uniform2f(u.u_center, ...frame.center);
    gl.uniform1f(u.u_radius, frame.radius);
    gl.uniform1f(u.u_cover, frame.cover ? 1 : 0);
    gl.uniform1f(u.u_alpha, frame.alpha);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    const gl = this.gl;
    if (this.texture) gl.deleteTexture(this.texture);
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
    this.texture = null;
  }
}
