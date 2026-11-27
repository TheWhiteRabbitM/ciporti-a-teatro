(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const PI = Math.PI;
  /* disegno a mano: tratto color osso, interni scuri come il fondale, dettagli in oro */
  const { INK, LIGHT, FILL, C, rivet, cut, P, LN, PC, CC, DOT, DARK, SHOE, CREAM, leg, arm, star, PROPS, HP, SHIRT, BODY, CAPE, HEAD, FACE, HAIR, RAYS, CROWN, LASH, ROD, head, ASPETTO, pupSVG, dleg, DONKEY } = window.CIP;

  /* =====================================================================
     Ingresso: titolo lettera per lettera, luci della ribalta, barra
     ===================================================================== */
  const lights = document.getElementById("lights");
  for (let i = 0; i < 18; i++) { const l = document.createElement("i"); l.style.setProperty("--i", i); lights.appendChild(l); }
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-open")));

  const bar = document.getElementById("bar");
  const theatreEl = document.getElementById("storia");
  const setBar = () => {};

  /* =====================================================================
     Teatro delle ombre: sagome di profilo con spalla, gomito, anca e
     ginocchio, che camminano, recitano e si inchinano.
     ===================================================================== */
  /* --- pezzi delle sagome: forme piene e affusolate, come cartoncino ritagliato, con i fori da cui passa la luce --- */
  /* le forme ereditano tratto e riempimento dal gruppo #pups; i dettagli in oro sono pieni e senza tratto */

  /* il copione: posizioni sul palco nel corso della storia (p da 0 a 1) e verso in cui guardano da fermi */
  const KIDS = [
    { ...ASPETTO.mia,
      keys: [[0, 190], [0.12, 190], [0.15, 260], [0.25, 260], [0.27, 300], [0.312, 300], [0.33, 220], [0.375, 220], [0.395, 620], [0.437, 620], [0.455, 300], [0.5, 300], [0.56, 220], [1, 220]], intro: -360, delay: 0.9, faces: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { ...ASPETTO.teo,
      keys: [[0, 300], [0.12, 300], [0.15, 370], [0.25, 370], [0.27, 500], [0.312, 500], [0.33, 420], [0.375, 420], [0.395, 400], [0.437, 400], [0.455, 500], [0.5, 500], [0.56, 340], [1, 340]], intro: -460, delay: 0.3, faces: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { ...ASPETTO.sole,
      keys: [[0, 660], [0.12, 660], [0.15, 480], [0.25, 480], [0.27, 390], [0.312, 390], [0.33, 320], [0.375, 320], [0.395, 300], [0.437, 300], [0.455, 400], [0.5, 400], [0.56, 460], [1, 460]], intro: 480, delay: 0.6, faces: [-1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { ...ASPETTO.bea,
      keys: [[0, 520], [0.12, 520], [0.15, 590], [0.25, 590], [0.27, 620], [0.312, 620], [0.33, 520], [0.375, 520], [0.395, 490], [0.437, 490], [0.455, 720], [0.5, 720], [0.56, 580], [1, 580]], intro: -680, delay: 0, faces: [1, 1, -1, 1, 1, -1, 1, 1, 1] },
    { ...ASPETTO.leo,
      keys: [[0, 830], [0.12, 830], [0.15, 700], [0.25, 700], [0.27, 720], [0.312, 720], [0.33, 780], [0.375, 780], [0.395, 820], [0.437, 820], [0.455, 600], [0.5, 600], [0.57, 700], [1, 700]], intro: 360, delay: 1.2, faces: [-1, -1, -1, -1, -1, 1, 1, 1, 1] },
  ];


  const pupsLayer = document.getElementById("pups");
  /* l'asinello: di profilo, con la coperta d'oro, le orecchie che si muovono e la coda che scodinzola */
  pupsLayer.innerHTML = DONKEY + KIDS.map(pupSVG).join("");
  const donkey = (() => {
    const el = document.getElementById("donkey");
    return { el, legs: [...el.querySelectorAll(".dleg")], head: el.querySelector(".dhead"), ears: el.querySelector(".dears"), tail: el.querySelector(".dtail"),
      keys: [[0, 1320], [0.5, 1320], [0.58, 845], [1, 845]], lastX: null, dir: -1, phase: 0, mv: 0 };
  })();
  function drawDonkey(p, t, dt) {
    const d = donkey;
    const x = posAt(d.keys, p);
    const dx = d.lastX === null ? 0 : x - d.lastX;
    d.lastX = x;
    const walkInPlace = reduced ? 0 : smooth(0.57, 0.59, p) * (1 - smooth(0.72, 0.74, p));
    const moving = Math.abs(dx) > 0.15 && !reduced ? 1 : 0;
    d.mv = lerp(d.mv, Math.max(moving, walkInPlace), reduced ? 1 : clamp(dt * 9));
    d.dir = moving ? Math.sign(dx) : 1;
    if (!reduced) d.phase += Math.abs(dx) / 34 * PI + walkInPlace * dt * 7;
    const ph = d.phase, m = d.mv;
    const sw = [Math.sin(ph), Math.sin(ph + PI), Math.sin(ph + PI), Math.sin(ph)];
    d.legs.forEach((l, i) => set(l, `translate(${l.dataset.x} -66) rotate(${f1(22 * sw[i] * m)})`));
    const bob = 2.5 * Math.abs(Math.cos(ph)) * m;
    const bow = Math.sin(PI * clamp((p - 0.86) / 0.09));
    set(d.el, `translate(${f1(x)} ${f1(522 - bob)}) scale(${f1(d.dir * 1.18)} 1.18)`);
    set(d.head, `rotate(${f1(5 * Math.sin(ph * 2) * m + 26 * bow + 2 * Math.sin(t * 1.3))} 44 -104)`);
    const twitch = Math.max(0, Math.sin(t * 0.9) ** 24) * 14;
    set(d.ears, `rotate(${f1(-twitch)} 66 -158)`);
    set(d.tail, `translate(-50 -98) rotate(${f1(12 * Math.sin(t * 3.1))})`);
  }

  /* il paese sullo sfondo, ricalcato dalla foto: montagne, collina, case a gradoni e la torre in cima */
  (function village() {
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const fx = (n) => n.toFixed(1);
    const out = [];
    out.push(`<path d="M-20 318Q60 262 170 292Q260 240 380 270Q470 222 600 262Q700 232 800 272Q900 252 1020 286" fill="none" stroke-opacity="0.55"/>`);
    out.push(`<path d="M-20 522Q110 478 250 446Q390 384 530 356Q660 372 780 432Q890 478 1020 494V540H-20Z"/>`);
    out.push(`<path d="M522 372V300L528 300V294H534V300H540V294H546V300H552V294H558V300H562V372Z"/><path d="M538 330V322Q542 316 546 322V330Z" fill="${LIGHT}" stroke="none"/>`);
    for (let r = 5; r >= 0; r--) {
      const base = 486 - r * 25, half = 300 - r * 46, cx = 510 + r * 6;
      let x = cx - half - rnd() * 10;
      while (x < cx + half) {
        const w = 20 + rnd() * 20, h = 20 + rnd() * 16, y = base + rnd() * 8 - 4;
        const top = y - h, pitched = rnd() < 0.7;
        out.push(pitched
          ? `<path d="M${fx(x)} ${fx(y + 14)}V${fx(top)}L${fx(x + w / 2)} ${fx(top - 8)}L${fx(x + w)} ${fx(top)}V${fx(y + 14)}Z"/>`
          : `<path d="M${fx(x)} ${fx(y + 14)}V${fx(top)}H${fx(x + w)}V${fx(y + 14)}Z"/>`);
        if (rnd() < 0.45) out.push(`<rect x="${fx(x + w * 0.35)}" y="${fx(top + 6)}" width="5" height="6" fill="${LIGHT}" stroke="none"/>`);
        x += w - 2;
      }
    }
    const olive = (x, s) => `<g transform="translate(${x} 522) scale(${s})"><path d="M0 0Q-6 -30 4 -50Q10 -64 0 -78" fill="none" stroke-width="3"/><path d="M-50 -82Q-58 -110 -30 -118Q-22 -144 4 -138Q28 -150 40 -126Q62 -118 52 -90Q44 -72 10 -76Q-20 -66 -50 -82Z"/>${cut("M-30 -100l6 -4M-8 -118l5 -5M18 -110l6 -3M30 -94l5 -5M-14 -90l5 -4", 1.4)}</g>`;
    out.push(olive(150, 1.05), olive(870, 0.95));
    out.push(`<path d="M330 540Q380 506 450 494Q540 480 488 452Q450 432 528 410" fill="none" stroke-opacity="0.6" stroke-dasharray="1 7" stroke-width="3"/>`);
    document.getElementById("borgo").innerHTML = out.join("");
  })();
  KIDS.forEach((k) => {
    const el = document.getElementById(`pup-${k.id}`);
    const q = (s) => el.querySelector(s);
    Object.assign(k, {
      el, legs: q(".legs"), upper: q(".upper"), head: q(".head"), eye: q(".eye"),
      legF: q(".legF"), legB: q(".legB"), shinF: q(".legF .shin"), shinB: q(".legB .shin"),
      armF: q(".armF"), armB: q(".armB"), foreF: q(".armF .fore"), foreB: q(".armB .fore"),
      pr: { mask: q(".pr-mask"), book: q(".pr-book"), wand: q(".pr-wand"), can: q(".pr-can") },
      drops: [...el.querySelectorAll(".drop")],
      maskFace: q(".maskface"),
      phase: 0, mv: 0, lastX: null, dir: 1,
    });
  });

  const posAt = (keys, p) => {
    if (p <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (p <= keys[i][0]) {
        const [p0, x0] = keys[i - 1], [p1, x1] = keys[i];
        const u = (p - p0) / (p1 - p0);
        return lerp(x0, x1, u * u * (3 - 2 * u));
      }
    }
    return keys[keys.length - 1][1];
  };

  const NEUTRAL = { lean: 0, nod: 0, shF: 8, elF: 10, shB: -8, elB: 10, hipF: 0, kneeF: 0, hipB: 0, kneeB: 0, bob: 0 };
  const sn = (t, f, ph) => Math.sin(t * f + ph);

  /* che cosa fa ciascuno: A arrivo e saluto, B ognuno la sua attivita', C cammino, D mano nella mano e inchino */
  const ACT = {
    mia: (t) => ({
      A: { shF: 22, elF: 16, lean: 3 },
      B: { shF: 30 + 16 * sn(t, 5, 0), elF: 18, shB: 46 + 16 * sn(t, 5, 0), elB: 30, lean: 16 },
    }),
    teo: (t, ph) => ({
      A: { shF: 150, elF: 8 + 14 * sn(t, 4, ph) },
      B: { shF: 76, elF: 72, shB: 42, elB: 62, nod: 14, lean: 3 },
    }),
    sole: (t, ph) => ({
      A: { shF: 150, elF: 20 + 26 * sn(t, 6, ph) },
      B: { hipF: 82, kneeF: 116, hipB: 72, kneeB: 120, bob: -36, lean: 10, shF: 24, elF: 46, shB: 12, nod: -6 },
    }),
    bea: (t, ph) => ({
      A: { shF: 138, elF: 22 + 24 * sn(t, 5, ph) },
      B: { lean: 24, nod: 16, shF: 62, elF: 22, shB: -10 },
    }),
    leo: (t) => ({
      A: { shF: 140 + 8 * sn(t, 1.6, 0), elF: 26, shB: 130 + 8 * sn(t, 1.6, 1), elB: 26 },
      B: { shF: 152 + 8 * sn(t, 1.4, 0), elF: 30, shB: 142 + 8 * sn(t, 1.4, 1), elB: 30, nod: -4 },
    }),
  };
  const HANDS = { shF: 72, elF: 4, shB: -58, elB: 4 };

  /* le battute seguono i sopratitoli: 0 arrivo e saluto, 1 volontari (tutti alzano la mano), 2 educazione (Teo legge,
     gli altri seduti ascoltano), 3 ambiente (Leo annaffia il fiore), 4 giornate ecologiche (Mia spazza le foglie),
     5 visite guidate (Bea fa da guida), 6-7 cammino verso il paese, 8 diventa socio (mano nella mano e inchino) */
  const BEATS = [0, 0.12, 0.25, 0.312, 0.375, 0.437, 0.5, 0.625, 0.75, 1.01];
  const beatWeights = (p) => BEATS.slice(0, 9).map((a, i) => smooth(a - 0.012, a + 0.012, p) * (1 - smooth(BEATS[i + 1] - 0.012, BEATS[i + 1] + 0.012, p)));
  const beatAt = (p) => { let i = 0; while (i < 8 && p >= BEATS[i + 1]) i++; return i; };
  const SIT = { hipF: 84, kneeF: 118, hipB: 74, kneeB: 120, bob: -36, lean: 4, shF: 22, elF: 50, shB: 18, elB: 40, nod: 8 };
  const LOOK = { nod: 6, shF: 14, elF: 30, shB: -14, elB: 30 };
  const BEAT = {
    1: (k, t) => (k.id === "leo" ? { shF: 160 + 6 * sn(t, 5, 0), elF: 6, shB: 150 + 6 * sn(t, 5, 1), elB: 6 } : { shF: 162 + 8 * sn(t, 6, k.ph), elF: 6 + 10 * sn(t, 6, k.ph), nod: -4 }),
    2: (k, t) => (k.id === "teo" ? { shF: 76, elF: 72, shB: 42, elB: 62, nod: 14 + 4 * sn(t, 3, 0), lean: 3 } : SIT),
    3: (k, t) => (k.id === "leo" ? { shF: 66 + 4 * sn(t, 2, 0), elF: 16, lean: 10, nod: 16 } : LOOK),
    4: (k, t) => (k.id === "mia" ? { shF: 30 + 16 * sn(t, 5, 0), elF: 18, shB: 46 + 16 * sn(t, 5, 0), elB: 30, lean: 16 } : { ...LOOK, nod: 2 }),
    5: (k, t) => (k.id === "bea" ? { shF: 150 + 8 * sn(t, 3, 0), elF: 10, shB: 60, elB: 70, nod: -6 } : { nod: -8, shF: 20, elF: 20 }),
  };

  const set = (el, v) => el.setAttribute("transform", v);
  const f1 = (n) => n.toFixed(2);

  const T0 = performance.now() / 1000;
  function drawPup(k, p, t, dt, W) {
    const since = performance.now() / 1000 - T0;
    const intro = reduced ? 1 : smooth(0, 1, (since - 3.2 - k.delay) / 2.6);
    const x = posAt(k.keys, p) + (1 - intro) * k.intro * W.A;
    const dx = k.lastX === null ? 0 : x - k.lastX;
    k.lastX = x;
    const walkInPlace = reduced ? 0 : smooth(0.57, 0.59, p) * (1 - smooth(0.72, 0.74, p));
    const moving = Math.abs(dx) > 0.15 && !reduced ? 1 : 0;
    k.mv = lerp(k.mv, Math.max(moving, walkInPlace), reduced ? 1 : clamp(dt * 9));
    if (moving) k.dir = Math.sign(dx);
    else k.dir = k.faces[beatAt(p)];
    if (!reduced) k.phase += Math.abs(dx) / 30 * PI + walkInPlace * dt * 7.5;

    /* posa della scena, mescolata tra scene vicine */
    const acts = ACT[k.id](t, k.ph);
    const pose = { ...NEUTRAL };
    const mix = (src, w) => { if (!src || w <= 0) return; for (const n in src) pose[n] += (src[n] - NEUTRAL[n]) * w; };
    mix(acts.A, W.bw[0]);
    for (let b = 1; b <= 5; b++) if (W.bw[b] > 0) mix(BEAT[b](k, t), W.bw[b]);
    mix(HANDS, W.bw[8]);
    const bow = Math.sin(PI * clamp((p - 0.86) / 0.09));
    /* inchino da figure frontali: si piegano sulle ginocchia e abbassano la testa, senza cadere di lato */
    pose.lean += 6 * bow;
    pose.nod += 22 * bow;
    pose.bob -= 14 * bow;
    pose.kneeF += 30 * bow; pose.kneeB += 30 * bow; pose.hipF += 16 * bow; pose.hipB += 16 * bow;

    /* passo */
    const ph = k.phase, sw = Math.sin(ph);
    const walk = {
      hipF: 26 * sw, hipB: -26 * sw,
      kneeF: 34 * Math.max(0, Math.cos(ph)), kneeB: 34 * Math.max(0, -Math.cos(ph)),
      shF: 8 - 22 * sw, shB: -8 + 22 * sw, elF: 16, elB: 16,
      lean: 4, bob: 3 * Math.abs(Math.cos(ph)), nod: 0,
    };
    const m = k.mv;
    const g = (n) => lerp(pose[n], walk[n], m);

    const breath = reduced ? 0 : Math.sin(t * 2 + k.ph) * 0.8;
    const lean = g("lean") + breath, bob = g("bob");
    set(k.el, `translate(${f1(x)} 522) scale(${f1(k.dir * k.s)} ${f1(k.s)})`);
    set(k.upper, `translate(0 ${f1(-bob)}) rotate(${f1(lean)} 0 -72)`);
    set(k.legF, `translate(7 ${f1(-72 - bob)}) rotate(${f1(-g("hipF"))})`);
    set(k.legB, `translate(-5 ${f1(-72 - bob)}) rotate(${f1(-g("hipB"))})`);
    set(k.shinF, `translate(0 36) rotate(${f1(g("kneeF"))})`);
    set(k.shinB, `translate(0 36) rotate(${f1(g("kneeB"))})`);
    const shF = g("shF"), elF = g("elF");
    set(k.armF, `translate(16 -119) rotate(${f1(-shF)})`);
    set(k.armB, `translate(-12 -119) rotate(${f1(-g("shB"))})`);
    set(k.foreF, `translate(0 27) rotate(${f1(-elF)})`);
    set(k.foreB, `translate(0 27) rotate(${f1(-g("elB"))})`);
    set(k.head, `rotate(${f1(g("nod"))} 3 -130)`);
    if (k.maskFace) set(k.maskFace, `translate(0 74) rotate(${f1(shF + elF + lean)})`);

    const b = (t * 0.27 + k.ph * 0.17) % 1;
    const blink = reduced ? 1 : (b < 0.03 ? Math.max(0.1, 1 - Math.sin((b / 0.03) * PI)) : 1);
    set(k.eye, `translate(2 -151) scale(1 ${f1(blink)}) translate(-2 151)`);

    const show = (el, v) => { if (el) el.setAttribute("opacity", f1(clamp(v))); };
    show(k.pr.mask, W.bw[0]);
    show(k.pr.book, W.bw[2]);
    show(k.pr.wand, 1 - W.bw[2]);
    show(k.pr.can, W.bw[3]);
    if (k.pr.can && W.bw[3] > 0.01) k.drops.forEach((d, i) => { const u = (t * 1.6 + i / 3) % 1; d.setAttribute("cx", f1(30 + 10 * u)); d.setAttribute("cy", f1(22 + 26 * u * u)); });
  }

  /* =====================================================================
     Scena: paese, collina che scorre, uccelli, fiore, foglie, luce che
     trema e tendine che si chiudono alla fine
     ===================================================================== */
  const borgo = document.getElementById("borgo");
  const collina = document.getElementById("collina");
  const birdsG = document.getElementById("birds");
  const flowerG = document.getElementById("flower");
  const leavesG = document.getElementById("leaves");
  const flicker = document.getElementById("flicker");
  const spot = document.getElementById("spot");
  const svgStage = document.getElementById("stage");
  const sign = document.getElementById("sign");
  let spotX = 310;

  birdsG.innerHTML = [0, 1, 2, 3].map(() => `<path d=""/>`).join("");
  const birds = [...birdsG.children];
  flowerG.innerHTML = `<path d="M0 0Q-5 -26 0 -52" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M0 -22Q-20 -30 -22 -14Q-8 -10 0 -22Z"/><path d="M0 -34Q18 -42 21 -27Q8 -23 0 -34Z"/><g transform="translate(0 -60)"><circle cx="0" cy="-10" r="7"/><circle cx="10" cy="-3" r="7"/><circle cx="6" cy="9" r="7"/><circle cx="-6" cy="9" r="7"/><circle cx="-10" cy="-3" r="7"/><circle r="5" fill="${LIGHT}" stroke="none"/></g>`;
  leavesG.innerHTML = [...Array(9)].map(() => `<path d="M0 0Q7 -8 16 0Q7 8 0 0Z"/>`).join("");
  const leaves = [...leavesG.children];

  function drawScene(p, t, W) {
    /* il paese resta sempre sullo sfondo; mentre i bambini camminano verso la torre si avvicina */
    const near = smooth(0.52, 0.76, p);
    set(borgo, `translate(520 522) scale(${f1(1 + 0.16 * near)}) translate(-520 -522)`);
    borgo.setAttribute("opacity", f1(0.5 + 0.15 * near));

    birdsG.setAttribute("opacity", f1(W.C));
    birds.forEach((b, i) => {
      const x = ((t * 55 + i * 260) % 1100) - 60;
      const y = 120 + i * 26 + 8 * Math.sin(t * 1.7 + i);
      const fl = 7 * Math.sin(t * 9 + i * 1.7);
      b.setAttribute("d", `M${f1(x - 14)} ${f1(y)}Q${f1(x - 7)} ${f1(y - fl)} ${f1(x)} ${f1(y)}Q${f1(x + 7)} ${f1(y - fl)} ${f1(x + 14)} ${f1(y)}`);
    });

    const grow = smooth(0.32, 0.37, p);
    flowerG.setAttribute("opacity", f1(clamp(W.bw[3] + W.bw[4] + W.bw[5])));
    set(flowerG, `translate(690 522) scale(${f1(Math.max(0.001, grow))})`);

    leavesG.setAttribute("opacity", f1(W.bw[4]));
    leaves.forEach((l, i) => {
      const fall = (t * 42 + i * 47) % 260;
      const x = 690 + ((i * 37) % 90) - 30 + 14 * Math.sin(t * 1.8 + i);
      set(l, `translate(${f1(x)} ${f1(270 + fall)}) rotate(${f1(t * 80 + i * 40)})`);
    });

    const fl = reduced ? 0 : Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1));
    flicker.setAttribute("opacity", f1(0.02 + 0.05 * fl));

    /* nella scena B la luce segue chi recita: lettura, albero, scopa, lente */
    const targets = [500, 735, 650, 720];
    const sub = clamp(Math.floor((p - 0.25) / 0.0625), 0, 3);
    spotX = lerp(spotX, targets[sub], reduced ? 1 : 0.08);
    spot.setAttribute("cx", f1(spotX));
    spot.setAttribute("opacity", f1(W.B * 0.85));

  }

  /* =====================================================================
     Scorrimento: progressione, pannelli, ciclo di disegno
     ===================================================================== */
  const story = document.getElementById("storia");
  const stage = document.getElementById("stage");
  const subs = [...document.querySelectorAll(".sub")].map((el) => ({ el, from: parseFloat(el.dataset.from), to: parseFloat(el.dataset.to) }));
  let lastSub = null;

  const storyProgress = () => {
    const r = story.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  };

  /* tempi dell'intera pagina: la storia occupa la prima parte, poi il sipario si richiude,
     le luci si abbassano e scorrono i titoli di coda */
  const STORY = 0.6, CLOSE = [0.6, 0.66], DIM = [0.64, 0.7], ROLL = [0.7, 0.975];
  const credits = document.getElementById("credits");
  const roll = document.getElementById("roll");
  const dim = document.getElementById("dim");
  const band = document.querySelector(".theatre__band");
  const endCard = document.getElementById("fine");
  const crest = document.getElementById("crest");
  let rollStart = 0, rollEnd = 0;
  const measureRoll = () => {
    const h = credits.clientHeight;
    rollStart = h;
    rollEnd = h / 2 - (endCard.offsetTop + endCard.offsetHeight / 2);
  };
  const rollY = (pt) => lerp(rollStart, rollEnd, clamp((pt - ROLL[0]) / (ROLL[1] - ROLL[0])));

  const hint = document.getElementById("hint");
  /* barra delle parti: quattro atti della storia e i titoli di coda */
  const ACTS = [0, 0.15, 0.3, 0.45, 0.6, 1];
  const actBtns = [...document.querySelectorAll("#acts-bar button")];
  const actFill = document.getElementById("acts-fill");
  let lastAct = -1;
  function drawActs(pt) {
    let i = 0;
    while (i < 4 && pt >= ACTS[i + 1]) i++;
    const within = clamp((pt - ACTS[i]) / (ACTS[i + 1] - ACTS[i]));
    actFill.style.width = `${f1(Math.min(100, (i + within) / 4 * 100))}%`;
    if (i !== lastAct) {
      actBtns.forEach((b, j) => { b.classList.toggle("is-current", j === i); b.classList.toggle("is-done", j < i); if (j === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
      lastAct = i;
    }
  }
  actBtns.forEach((b) => b.addEventListener("click", () => {
    const top = story.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + parseFloat(b.dataset.pt) * (story.offsetHeight - window.innerHeight), behavior: reduced ? "auto" : "smooth" });
  }));
  /* spettacolo automatico: dopo l'apertura del sipario la pagina scorre da sola a velocita' di lettura;
     si ferma appena il visitatore scorre a mano e riparte col pulsante */
  const ctl = document.getElementById("credits-ctl");
  const ctlLabel = ctl.querySelector("span");
  const SPEED = (pt) => pt < STORY ? STORY / 46 : pt < ROLL[0] ? (ROLL[0] - STORY) / 6 : (ROLL[1] - ROLL[0]) / 30; // pt al secondo
  let playing = false, ended = false, touched = false, scrollCarry = 0;
  const setCtl = () => {
    ctl.classList.toggle("is-paused", !playing);
    ctl.setAttribute("aria-pressed", String(!playing));
    ctlLabel.textContent = playing ? "Pausa" : ended ? "Rivedi lo spettacolo" : storyProgress() < 0.004 ? "Guarda lo spettacolo" : "Riprendi";
  };
  const play = () => {
    if (ended || storyProgress() >= ROLL[1] - 0.002) { ended = false; window.scrollTo({ top: story.offsetTop, behavior: "instant" }); }
    playing = true; scrollCarry = 0; setCtl();
  };
  const pause = () => { if (playing) { playing = false; setCtl(); } };
  ctl.addEventListener("click", () => (playing ? pause() : play()));
  const userScroll = () => { touched = true; pause(); };
  window.addEventListener("wheel", userScroll, { passive: true });
  window.addEventListener("touchstart", (e) => { if (!ctl.contains(e.target)) userScroll(); }, { passive: true });
  window.addEventListener("keydown", (e) => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key) && e.target !== ctl) userScroll(); });
  document.querySelectorAll(".bar a, #acts-bar button").forEach((el) => el.addEventListener("click", pause));
  /* parte da solo quando il sipario ha finito di aprirsi, se nessuno ha ancora toccato la pagina */
  if (!reduced) setTimeout(() => { if (!touched && storyProgress() < 0.004) play(); }, 5600);
  setCtl();
  ctl.classList.add("is-on");
  /* l'automatico avanza su un valore decimale (niente salti di pixel) e la pagina lo segue */
  let autoPt = null;
  function autoPlay(dt) {
    if (!playing) { autoPt = null; return null; }
    if (autoPt === null) autoPt = storyProgress();
    autoPt = Math.min(ROLL[1], autoPt + SPEED(autoPt) * dt);
    if (autoPt >= ROLL[1] - 0.0005) { playing = false; ended = true; setCtl(); }
    const span = story.offsetHeight - window.innerHeight;
    window.scrollTo({ top: Math.round(story.offsetTop + autoPt * span), behavior: "instant" });
    return autoPt;
  }

  function drawEnding(pt) {
    hint.classList.toggle("is-gone", pt > 0.006);
    drawActs(pt);
    const close = smooth(CLOSE[0], CLOSE[1], pt);
    window.__curtainClose = close;
    theatreEl.classList.toggle("is-closed", close > 0.6);
    const d = smooth(DIM[0], DIM[1], pt);
    dim.style.opacity = f1(d * 0.94);
    band.style.opacity = f1(1 - d);
    crest.style.opacity = d > 0.02 ? f1(1 - d) : "";
    band.style.visibility = d > 0.99 ? "hidden" : "";
    credits.classList.toggle("is-on", d > 0.5);
    bar.classList.toggle("is-solid", d > 0.5);
    roll.style.transform = `translate3d(0, ${rollY(pt).toFixed(1)}px, 0)`;
  }

  /* il tratto "vivo": il rumore che fa tremare le linee cambia seme alcune volte al secondo */
  const boil = document.getElementById("boil-n");
  let boilSeed = 1, boilAt = 0;

  let lastT = null, shownPt = null;
  function render(now) {
    const t = reduced ? 0 : now / 1000;
    const dt = lastT === null ? 0.016 : Math.min(0.1, Math.max(0, t - lastT));
    lastT = t;
    /* la scena segue lo scorrimento con un leggero ritardo morbido: la rotella non fa piu' saltare i personaggi */
    const target = autoPlay(dt) ?? storyProgress();
    if (shownPt === null || reduced || Math.abs(target - shownPt) > 0.08) shownPt = target;
    else shownPt += (target - shownPt) * (1 - Math.exp(-dt * 6));
    const pt = shownPt;
    drawEnding(pt);
    const p = clamp(pt / STORY);
    const cur = subs.find((s) => p >= s.from && p < s.to) || subs[subs.length - 1];
    if (cur !== lastSub) { subs.forEach((s) => s.el.classList.toggle("is-on", s === cur)); lastSub = cur; }
    const sB = smooth(0.22, 0.27, p), sC = smooth(0.47, 0.53, p), sD = smooth(0.73, 0.78, p);
    const W = { A: 1 - sB, B: sB - sC, C: sC - sD, D: sD, bw: beatWeights(p) };
    const signDown = smooth(0.76, 0.8, p);
    sign.setAttribute("transform", `translate(0 ${f1(-420 * (1 - signDown))}) rotate(${f1(1.5 * Math.sin(t * 1.3))} 500 0)`);
    sign.setAttribute("opacity", signDown > 0.001 ? "1" : "0");
    drawDonkey(p, t, dt);
    KIDS.forEach((k) => drawPup(k, p, t, dt, W));
    drawScene(p, t, W);
  }

  let visible = false, looping = false;
  function loop(now) {
    if (!visible) { looping = false; return; }
    render(now);
    requestAnimationFrame(loop);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !reduced && !looping) { looping = true; requestAnimationFrame(loop); }
    }, { rootMargin: "120px" }).observe(stage);
  }
  const fitStage = () => {
    const r = svgStage.getBoundingClientRect();
    const ratio = r.width / Math.max(1, r.height);
    /* telefono: solo la fascia dei bambini; schermo stretto: tutta la scena; schermo molto largo e basso:
       si mostra sempre dall'altezza delle teste in giu' (niente teste tagliate), allargando il fondale ai lati */
    let vb = "0 0 1000 540", par = "xMidYMax slice";
    if (ratio < 0.9) { vb = "130 160 830 400"; par = "xMidYMax meet"; }
    else if (ratio < 1.45) { vb = "60 0 880 540"; par = "xMidYMax meet"; }
    else if (ratio > 1000 / 440) { vb = "0 100 1000 440"; par = "xMidYMax meet"; }
    if (svgStage.getAttribute("viewBox") !== vb) svgStage.setAttribute("viewBox", vb);
    if (svgStage.getAttribute("preserveAspectRatio") !== par) svgStage.setAttribute("preserveAspectRatio", par);
  };
  if ("ResizeObserver" in window) new ResizeObserver(fitStage).observe(svgStage);
  fitStage();
  measureRoll();
  window.addEventListener("resize", () => { fitStage(); measureRoll(); });
  window.addEventListener("load", measureRoll);
  const onScroll = () => { setBar(); if (reduced) render(0); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  setBar();
  render(performance.now());

  document.querySelectorAll("a[data-p]").forEach((a) => {
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      const top = story.getBoundingClientRect().top + window.scrollY;
      const span = story.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + parseFloat(a.dataset.p) * STORY * span, behavior: reduced ? "auto" : "smooth" });
    });
  });
  /* i link a contatti, appuntamenti e iscrizione portano al punto dei titoli di coda in cui la voce e' al centro */
  document.querySelectorAll("a[data-credit]").forEach((a) => {
    a.addEventListener("click", (ev) => {
      const el = document.querySelector(a.getAttribute("href"));
      if (!el) return;
      ev.preventDefault();
      measureRoll();
      const y = credits.clientHeight / 2 - (el.offsetTop + el.offsetHeight / 2);
      const u = clamp((y - rollStart) / (rollEnd - rollStart));
      const pt = ROLL[0] + u * (ROLL[1] - ROLL[0]);
      const top = story.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + pt * (story.offsetHeight - window.innerHeight), behavior: reduced ? "auto" : "smooth" });
    });
  });

  /* =====================================================================
     Appuntamenti da events.js
     ===================================================================== */
  (function events() {
    const list = document.getElementById("events-list");
    const empty = document.getElementById("events-empty");
    const items = (window.EVENTI || []).slice().sort((a, b) => String(a.data).localeCompare(String(b.data)));
    if (!items.length) { empty.hidden = false; return; }
    items.forEach((e) => {
      const d = new Date(`${e.data}T00:00:00`);
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = d.toLocaleDateString("it-IT", { day: "numeric", month: "long" }) + (e.ora ? `, ${e.ora}` : "");
      const dd = document.createElement("dd");
      dd.textContent = [e.titolo, e.luogo].filter(Boolean).join(", ");
      row.append(dt, dd);
      list.appendChild(row);
    });
  })();
})();
