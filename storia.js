/* La nostra storia: ogni atto ha la sua scenetta con i bambini dello spettacolo (personaggi.js).
   Le scene si muovono solo quando sono sullo schermo; con "riduci movimento" restano ferme. */
(() => {
  "use strict";
  const { ASPETTO, pupSVG, DONKEY, PROPS, PC, DOT, LN, INK, LIGHT, FILL, DARK, CREAM, star } = window.CIP;
  document.documentElement.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PI = Math.PI;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const f2 = (n) => n.toFixed(2);
  const sn = (t, f, ph = 0) => Math.sin(t * f + ph);
  const set = (el, v) => el && el.setAttribute("transform", v);

  /* oggetti nuovi per la storia: la coppa dei premi e l'asta dello striscione */
  const TROPHY = `<g class="pr">${PC("M-7 28L7 28L6 33L-6 33Z", "#B4532A")}<path d="M0 33L0 41" stroke="${INK}" stroke-width="3"/>`
    + `${PC("M-3 41Q-15 44 -15 64L15 64Q15 44 3 41Z", LIGHT)}<path d="M-14 60Q-24 56 -18 48M14 60Q24 56 18 48" fill="none" stroke="${INK}" stroke-width="2.4"/>${star(0, 53, 0.42, CREAM)}</g>`;
  const POLE = `<g class="pr"><path d="M0 18L0 150" stroke="${INK}" stroke-width="3"/>${DOT(0, 152, 4, LIGHT)}</g>`;

  const NEUTRAL = { lean: 0, nod: 0, shF: 8, elF: 10, shB: -8, elB: 10, hipF: 0, kneeF: 0, hipB: 0, kneeB: 0, bob: 0 };
  const SIT = { hipF: 84, kneeF: 118, hipB: 74, kneeB: 120, bob: -36, lean: 4, shF: 22, elF: 50, shB: 18, elB: 40, nod: 8 };
  const HANDS = { shF: 72, elF: 4, shB: -58, elB: 4 };
  const CLAP = (t, ph) => { const c = sn(t, 6, ph); return { shF: 138 + 12 * c, elF: 18 + 16 * c, shB: -138 - 12 * c, elB: -18 - 16 * c, nod: -6 }; }; /* evviva: braccia a V che sventolano */
  const WAVE = (t, ph) => ({ shF: 150, elF: 20 + 26 * sn(t, 6, ph), nod: -4 });
  const HAND_UP = (t, ph) => ({ shF: 162 + 8 * sn(t, 6, ph), elF: 6 + 10 * sn(t, 6, ph), nod: -4 });
  const READ = (t) => ({ shF: 76, elF: 72, shB: 42, elB: 62, nod: 14 + 4 * sn(t, 2.4), lean: 3 });
  /* inchino lento ogni sei secondi, piegando le ginocchia come nello spettacolo */
  const bowAt = (t) => { const u = (t % 6) / 6; return u > 0.7 ? Math.sin(PI * (u - 0.7) / 0.3) : 0; };
  const BOW = (t) => { const b = bowAt(t); return { ...HANDS, lean: 6 * b, nod: 22 * b, bob: -14 * b, kneeF: 30 * b, kneeB: 30 * b, hipF: 16 * b, hipB: 16 * b }; };

  /* sipario dipinto ai lati e luce dall'alto: la cornice comune a tutte le scenette */
  const frame = (id, w, h, floor, spotX = w / 2, spotW = w * 0.32) => ({
    defs: `<radialGradient id="${id}-l" gradientUnits="userSpaceOnUse" cx="${w / 2}" cy="${h * 0.42}" r="${w * 0.62}"><stop offset="0" stop-color="#5A2216"/><stop offset="0.5" stop-color="#2E0F09"/><stop offset="1" stop-color="#0E0503"/></radialGradient>`
      + `<radialGradient id="${id}-s"><stop offset="0" stop-color="#F7DFA6" stop-opacity="0.3"/><stop offset="1" stop-color="#F7DFA6" stop-opacity="0"/></radialGradient>`
      + `<pattern id="${id}-v" width="44" height="10" patternUnits="userSpaceOnUse"><rect width="44" height="10" fill="#7A2E1D"/><rect x="18" width="9" height="10" fill="#8E3825"/><rect x="27" width="17" height="10" fill="#64261A"/></pattern>`,
    back: `<rect width="${w}" height="${h}" fill="url(#${id}-l)"/><ellipse cx="${spotX}" cy="${floor - h * 0.3}" rx="${spotW}" ry="${h * 0.48}" fill="url(#${id}-s)"/>`,
    floor: `<rect x="0" y="${floor}" width="${w}" height="${h - floor}" fill="#0E0503"/><path d="M0 ${floor + 1}Q${w / 4} ${floor - 3} ${w / 2} ${floor + 1}T${w} ${floor}" fill="none" stroke="${INK}" stroke-width="2.6"/>`,
    curtain: `<path d="M0 0H${w * 0.09}Q${w * 0.055} ${h * 0.5} ${w * 0.085} ${h}H0Z" fill="url(#${id}-v)"/><path d="M${w} 0H${w * 0.91}Q${w * 0.945} ${h * 0.5} ${w * 0.915} ${h}H${w}Z" fill="url(#${id}-v)"/>`
      + `<path d="M0 0H${w}V${h * 0.07}` + [...Array(10)].map((_, i) => `Q${w - (i + 0.5) * w / 10} ${h * 0.13} ${w - (i + 1) * w / 10} ${h * 0.07}`).join("") + `Z" fill="url(#${id}-v)"/>`
      + `<path d="M0 ${h * 0.07}` + [...Array(10)].map((_, i) => `Q${(i + 0.5) * w / 10} ${h * 0.13} ${(i + 1) * w / 10} ${h * 0.07}`).join("") + `" fill="none" stroke="${LIGHT}" stroke-width="2.4"/>`,
  });

  /* le scene: chi c'e', dove sta, cosa tiene in mano e cosa fa */
  const SCENES = {
    apertura: { w: 1000, h: 420, floor: 384, scale: 0.92, spotW: 420,
      kids: [
        { look: "mia", x: 250, props: "", pose: WAVE },
        { look: "teo", x: 380, props: PROPS.mask, pose: (t) => ({ shF: 150, elF: 8 + 12 * sn(t, 3) }) },
        { look: "sole", x: 510, props: "", pose: WAVE, dir: -1 },
        { look: "bea", x: 640, props: PROPS.wand, pose: WAVE, dir: -1 },
        { look: "leo", x: 770, props: "", pose: (t) => ({ shF: 140 + 8 * sn(t, 1.6), elF: 26, shB: 130 + 8 * sn(t, 1.6, 1), elB: 26 }), dir: -1 },
      ],
    },
    prologo: { w: 640, h: 420, floor: 372, scale: 0.9, spotX: 280, spotW: 150,
      back: `<path d="M470 372V262" stroke="${INK}" stroke-width="3"/><path d="M412 204H528Q534 204 534 210V258Q534 264 528 264H412Q406 264 406 258V210Q406 204 412 204Z" fill="#4A2A1C" stroke="${INK}" stroke-width="2.6"/>`
        + `<text x="470" y="247" text-anchor="middle" class="vig__chalk" fill="${LIGHT}">1987</text>`,
      kids: [{ look: "teo", x: 280, props: PROPS.mask, pose: (t) => ({ shF: 132 + 4 * sn(t, 1.2), elF: 8 + 12 * sn(t, 2.2), nod: -6 }) }],
    },
    premi: { w: 640, h: 420, floor: 372, scale: 1.02, spotW: 210,
      kids: [
        { look: "mia", x: 170, props: "", pose: CLAP },
        { look: "bea", x: 320, props: TROPHY, pose: (t) => ({ shF: 160 + 6 * sn(t, 2.4), elF: 4, shB: -20, elB: 20, nod: -8 }) },
        { look: "sole", x: 470, props: "", pose: CLAP, dir: -1 },
      ],
      confetti: true,
    },
    amici: { w: 640, h: 420, floor: 372, scale: 0.9, spotW: 230,
      front: `<path d="M196 58Q320 80 444 58V110Q320 132 196 110Z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.6"/>`
        + `<text x="320" y="100" text-anchor="middle" class="vig__banner" fill="${DARK}">Amici del Teatro</text>`,
      kids: [
        { look: "mia", x: 178, props: POLE, pose: () => ({ shF: 178, elF: 0, shB: -10, nod: -6 }) },
        { look: "teo", x: 320, props: "", pose: WAVE },
        { look: "leo", x: 462, props: POLE, pose: () => ({ shF: 178, elF: 0, shB: -10, nod: -6 }), dir: -1 },
      ],
    },
    scuola: { w: 640, h: 420, floor: 372, scale: 1.0, spotX: 300, spotW: 260,
      back: `<rect x="96" y="62" width="270" height="96" rx="4" fill="#1F3A2C" stroke="${INK}" stroke-width="2.6"/><path d="M104 164H358" stroke="${INK}" stroke-width="3"/>`
        + `<text x="231" y="108" text-anchor="middle" class="vig__chalk" fill="${CREAM}">Teatro Scuola</text><path d="M166 126Q231 138 296 126" fill="none" stroke="${CREAM}" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>`,
      kids: [
        { look: "sole", x: 150, props: "", pose: () => SIT },
        { look: "bea", x: 265, props: "", pose: (t) => ({ ...SIT, nod: 8 + 3 * sn(t, 1.5) }) },
        { look: "teo", x: 455, props: PROPS.book, pose: READ, dir: -1 },
      ],
    },
    comunita: { w: 640, h: 420, floor: 372, scale: 0.86, spotW: 280,
      kids: [
        { look: "mia", x: 120, props: "", pose: HAND_UP },
        { look: "teo", x: 220, props: "", pose: HAND_UP },
        { look: "sole", x: 320, props: "", pose: HAND_UP },
        { look: "bea", x: 420, props: PROPS.wand, pose: HAND_UP, dir: -1 },
        { look: "leo", x: 520, props: "", pose: (t) => ({ shF: 160 + 6 * sn(t, 5), elF: 6, shB: 150 + 6 * sn(t, 5, 1), elB: 6 }), dir: -1 },
      ],
    },
    vernacolo: { w: 640, h: 420, floor: 372, scale: 1.0, spotX: 340, spotW: 260,
      kids: [
        { look: "sole", x: 120, props: PROPS.book, pose: READ },
        { look: "mia", x: 300, props: "", pose: (t) => ({ shF: 96 + 10 * sn(t, 3), elF: 40, shB: -20, nod: -4 }) },
      ],
      donkey: { x: 470, dir: -1, s: 1.02 },
    },
    oggi: { w: 640, h: 420, floor: 372, scale: 0.8, spotW: 290,
      back: `<g><path d="M252 0V96M388 0V96" fill="none" stroke="${INK}" stroke-width="2"/><path d="M216 94H424Q430 94 430 100V140Q430 146 424 146H216Q210 146 210 140V100Q210 94 216 94Z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.6"/>`
        + `<text x="320" y="128" text-anchor="middle" class="vig__sign" fill="${DARK}">CIPorti a teatro?</text></g>`,
      kids: [
        { look: "mia", x: 140, props: "", pose: BOW },
        { look: "teo", x: 230, props: "", pose: BOW },
        { look: "sole", x: 320, props: "", pose: BOW },
        { look: "bea", x: 410, props: "", pose: BOW },
        { look: "leo", x: 500, props: "", pose: BOW },
      ],
    },
  };

  /* disegna una scenetta nel suo contenitore e prepara i pezzi da muovere */
  function build(el, sc) {
    const id = `sc-${el.dataset.scene}`;
    const fr = frame(id, sc.w, sc.h, sc.floor, sc.spotX, sc.spotW);
    const kidsSVG = sc.kids.map((k) => pupSVG({ ...ASPETTO[k.look], propsF: k.props }).replace(/ id="[^"]*"/, "")).join("");
    const donkeySVG = sc.donkey ? DONKEY.replace(' id="donkey"', ' class="donkey"') : "";
    const confetti = sc.confetti ? `<g class="confetti">${[...Array(14)].map((_, i) => star(0, 0, 0.32 + (i % 3) * 0.08, i % 2 ? LIGHT : CREAM)).join("")}</g>` : "";
    el.innerHTML = `<svg viewBox="0 0 ${sc.w} ${sc.h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>${fr.defs}</defs>${fr.back}${sc.back || ""}`
      + `<g class="cast" fill="${FILL}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${donkeySVG}${kidsSVG}</g>`
      + `${sc.front || ""}${confetti}${fr.floor}${fr.curtain}</svg>`;
    const pups = [...el.querySelectorAll(".pup")];
    const cast = sc.kids.map((k, i) => {
      const g = pups[i], q = (s) => g.querySelector(s);
      return { ...ASPETTO[k.look], ...k, el: g, upper: q(".upper"), head: q(".head"), eye: q(".eye"),
        legF: q(".legF"), legB: q(".legB"), shinF: q(".legF .shin"), shinB: q(".legB .shin"),
        armF: q(".armF"), armB: q(".armB"), foreF: q(".armF .fore"), foreB: q(".armB .fore"), maskFace: q(".maskface") };
    });
    let donkey = null;
    if (sc.donkey) {
      const d = el.querySelector(".donkey");
      donkey = { ...sc.donkey, el: d, head: d.querySelector(".dhead"), ears: d.querySelector(".dears"), tail: d.querySelector(".dtail"), legs: [...d.querySelectorAll(".dleg")] };
      donkey.legs.forEach((l) => set(l, `translate(${l.dataset.x} -66)`));
    }
    const stars = sc.confetti ? [...el.querySelectorAll(".confetti polygon")] : [];
    return { el, sc, cast, donkey, stars, live: false, t0: Math.random() * 10 };
  }

  /* la stessa meccanica dello spettacolo: spalla, gomito, anca, ginocchio, testa e respiro */
  function poseKid(k, sc, t) {
    const pose = { ...NEUTRAL, ...k.pose(t, k.ph) };
    const s = k.s * sc.scale, dir = k.dir || 1;
    const breath = reduced ? 0 : Math.sin(t * 2 + k.ph) * 0.8;
    const lean = pose.lean + breath, bob = pose.bob;
    set(k.el, `translate(${k.x} ${sc.floor}) scale(${f2(dir * s)} ${f2(s)})`);
    set(k.upper, `translate(0 ${f2(-bob)}) rotate(${f2(lean)} 0 -72)`);
    set(k.legF, `translate(7 ${f2(-72 - bob)}) rotate(${f2(-pose.hipF)})`);
    set(k.legB, `translate(-5 ${f2(-72 - bob)}) rotate(${f2(-pose.hipB)})`);
    set(k.shinF, `translate(0 36) rotate(${f2(pose.kneeF)})`);
    set(k.shinB, `translate(0 36) rotate(${f2(pose.kneeB)})`);
    set(k.armF, `translate(16 -119) rotate(${f2(-pose.shF)})`);
    set(k.armB, `translate(-12 -119) rotate(${f2(-pose.shB)})`);
    set(k.foreF, `translate(0 27) rotate(${f2(-pose.elF)})`);
    set(k.foreB, `translate(0 27) rotate(${f2(-pose.elB)})`);
    set(k.head, `rotate(${f2(pose.nod)} 3 -130)`);
    if (k.maskFace) set(k.maskFace, `translate(0 74) rotate(${f2(pose.shF + pose.elF + lean)})`);
    const b = (t * 0.27 + k.ph * 0.17) % 1;
    const blink = reduced ? 1 : b < 0.03 ? Math.max(0.1, 1 - Math.sin((b / 0.03) * PI)) : 1;
    set(k.eye, `translate(2 -151) scale(1 ${f2(blink)}) translate(-2 151)`);
  }

  function poseDonkey(d, sc, t) {
    set(d.el, `translate(${d.x} ${sc.floor}) scale(${f2(d.dir * d.s)} ${f2(d.s)})`);
    /* ascolta e annuisce piano */
    set(d.head, `rotate(${f2(6 + 6 * Math.max(0, sn(t, 1.1)) ** 3)} 44 -104)`);
    set(d.ears, `rotate(${f2(-Math.max(0, Math.sin(t * 0.9) ** 24) * 14)} 66 -158)`);
    set(d.tail, `translate(-50 -98) rotate(${f2(12 * sn(t, 3.1))})`);
  }

  function draw(v, now) {
    const t = reduced ? 0 : now / 1000 + v.t0;
    v.cast.forEach((k) => poseKid(k, v.sc, t));
    if (v.donkey) poseDonkey(v.donkey, v.sc, t);
    v.stars.forEach((s, i) => {
      const u = ((reduced ? 0.5 : t * 0.16) + i / v.stars.length) % 1;
      const x = 120 + ((i * 97) % 400) + 14 * Math.sin(u * 6 + i);
      s.setAttribute("transform", `translate(${f2(x)} ${f2(60 + u * 310)}) rotate(${f2(u * 360 + i * 40)})`);
      s.setAttribute("opacity", f2(clamp(Math.min(u * 6, (1 - u) * 4))));
    });
  }

  const views = [...document.querySelectorAll(".vig[data-scene]")].map((el) => build(el, SCENES[el.dataset.scene]));
  views.forEach((v) => draw(v, 0));
  /* il programma di sala segna l'atto che si sta leggendo */
  const links = [...document.querySelectorAll(".programma a")];
  const acts = links.map((a) => document.querySelector(a.getAttribute("href")));
  const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a, i) => a.classList.toggle("is-here", acts[i] === e.target));
  }), { rootMargin: "-45% 0px -50% 0px" });
  acts.forEach((a) => a && spy.observe(a));
  if (reduced) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = views.find((x) => x.el === e.target);
    if (v) v.live = e.isIntersecting;
  }), { rootMargin: "80px" });
  views.forEach((v) => io.observe(v.el));
  const loop = (now) => { views.forEach((v) => v.live && draw(v, now)); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);

})();
