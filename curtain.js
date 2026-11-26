/* Sipario di velluto disegnato in WebGL: pieghe illuminate dall'alto, apertura che raccoglie la stoffa
   verso le quinte, legacci dorati che la stringono e un'oscillazione che si spegne dopo l'apertura.
   Senza WebGL resta il sipario in CSS. */
(() => {
  "use strict";
  const canvas = document.getElementById("curtain");
  const hero = document.getElementById("stagewrap");
  if (!canvas || !hero) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;
  document.documentElement.classList.add("gl");

  const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
  const FS = `
precision highp float;
varying vec2 uv;
uniform vec2 res;
uniform float t;
uniform float openAmt;
uniform float energy;

const vec3 VEL  = vec3(0.50, 0.17, 0.10);
const vec3 DEEP = vec3(0.075, 0.018, 0.012);
const vec3 GOLD = vec3(0.89, 0.69, 0.29);
const float TIE = 0.60;

vec3 velvet(float s, float y, float side) {
  float wob = (0.16 * energy + 0.012) * sin(y * 3.6 + t * 1.25 + side * 2.3 + s * 2.6);
  float f = s * 12.0 + wob + side * 0.37;
  float c = cos(6.28318 * f);
  float crest = pow(0.5 + 0.5 * c, 1.7);
  float turn = pow(1.0 - abs(c), 7.0);
  float vert = mix(1.08, 0.66, smoothstep(0.0, 1.0, y));
  vec3 col = mix(DEEP, VEL, 0.14 + 0.86 * crest) * vert;
  col += turn * vec3(0.30, 0.10, 0.06);
  col *= mix(0.45, 1.0, smoothstep(1.0, 0.82, s));
  col *= mix(0.6, 1.0, smoothstep(0.0, 0.10, s));
  return col;
}

void main() {
  vec2 q = vec2(uv.x, 1.0 - uv.y);
  float y = q.y;
  float aa = 1.5 / res.x;
  float w = mix(0.506, 0.072, openAmt);
  float wy = w * (1.0 + openAmt * 2.5 * pow(abs(y - TIE), 1.35));

  float side = q.x < 0.5 ? 0.0 : 1.0;
  float x = side < 0.5 ? q.x : 1.0 - q.x;
  float s = x / wy;
  float hem = 1.0 - openAmt * 0.05 * s * s;

  float inside = smoothstep(wy + aa, wy - aa, x) * smoothstep(hem + 0.004, hem - 0.004, y);
  vec3 col = velvet(clamp(s, 0.0, 1.0), y, side);

  float fringe = smoothstep(hem - 0.03, hem - 0.022, y);
  col = mix(col, GOLD * (0.55 + 0.45 * pow(0.5 + 0.5 * cos(6.28318 * s * 12.0), 1.5)), fringe);

  float tie = (1.0 - smoothstep(0.009, 0.013, abs(y - TIE))) * smoothstep(0.35, 0.6, openAmt);
  col = mix(col, GOLD * mix(0.7, 1.05, 0.5 + 0.5 * cos(3.14159 * s)), tie);

  float shadow = (1.0 - smoothstep(0.0, 0.06, x - wy)) * step(wy, x) * 0.55 * smoothstep(0.0, 0.3, openAmt);
  float a = max(inside, shadow);
  vec3 outc = inside > 0.0 ? col * inside : vec3(0.0);
  gl_FragColor = vec4(outc, a);
}`;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(sh)); return null; }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { document.documentElement.classList.remove("gl"); return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { document.documentElement.classList.remove("gl"); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = { res: gl.getUniformLocation(prog, "res"), t: gl.getUniformLocation(prog, "t"), open: gl.getUniformLocation(prog, "openAmt"), energy: gl.getUniformLocation(prog, "energy") };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(hero.clientWidth * dpr), h = Math.round(hero.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  const START = 1600, DUR = 3400;
  let lastClose = 0, closeEnergy = 0, lastNow = 0;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  let t0 = null, visible = true, running = false;

  function draw(now) {
    if (t0 === null) t0 = now;
    const el = now - t0;
    const k = reduced ? 1 : Math.min(1, Math.max(0, (el - START) / DUR));
    const close = Math.min(1, Math.max(0, window.__curtainClose || 0));
    const dts = Math.max(0.001, (now - lastNow) / 1000);
    closeEnergy = Math.max(closeEnergy * Math.exp(-dts * 2), Math.min(1, Math.abs(close - lastClose) / dts * 0.6));
    lastClose = close; lastNow = now;
    const open = ease(k) * (1 - ease(close));
    const energy = reduced ? 0 : Math.sin(Math.PI * k) + (k >= 1 ? 0.25 * Math.exp(-(el - START - DUR) / 900) : 0) + closeEnergy;
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.t, reduced ? 0 : el / 1000);
    gl.uniform1f(U.open, open);
    gl.uniform1f(U.energy, energy);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  let last = 0;
  function loop(now) {
    if (!visible) { running = false; return; }
    const settled = t0 !== null && now - t0 > START + DUR + 3000 && closeEnergy < 0.02 && Math.abs((window.__curtainClose || 0) - lastClose) < 0.0005;
    if (!settled || now - last > 33) { draw(now); last = now; }   // after it settles, 30 fps is enough for the slow sway
    requestAnimationFrame(loop);
  }
  const start = () => { if (!running && !reduced) { running = true; requestAnimationFrame(loop); } };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(hero);
  }
  window.addEventListener("resize", () => { if (reduced) draw(performance.now()); });
  window.addEventListener("scroll", () => { if (reduced) draw(performance.now()); }, { passive: true });
  if (reduced) draw(performance.now()); else start();
})();
