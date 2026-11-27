/* I personaggi di CIPorti a teatro?: i cinque bambini e l'asinello, disegnati come stringhe SVG.
 * Li usano lo spettacolo della pagina principale (script.js) e la pagina della storia (storia.js).
 * Tratto color osso, interni scuri come il fondale, dettagli in oro. */
(() => {
  "use strict";
  const PI = Math.PI;
  const INK = "#EFE3CC", LIGHT = "#E3B04B", FILL = "#1A0906";

  const C = (x, y, r, f = INK) => f === INK ? `<circle cx="${x}" cy="${y}" r="${r}"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="none"/>`;
  const rivet = () => "";
  const cut = (d, w = 1.6) => `<path d="${d}" stroke="${LIGHT}" stroke-width="${w}" fill="none"/>`;
  const P = (d, f = INK) => f === INK ? `<path d="${d}"/>` : `<path d="${d}" fill="${f}" stroke="none"/>`;
  const LN = (d, w = 3) => `<path d="${d}" fill="none" stroke-width="${w}"/>`;
  const PC = (d, f) => `<path d="${d}" fill="${f}"/>`;
  const CC = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
  const DOT = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="none"/>`;
  const DARK = "#2A1A14", SHOE = "#4A2A1C", CREAM = "#FFF3D6";

  const leg = (c) => `<g class="${c}">${LN("M0 0Q1.5 18 0 36")}<g class="shin">${LN("M0 0Q-1.5 15 0 29")}${PC("M-3.4 27.5Q2 25.6 9.5 28.4Q17 31.2 17 35Q16 38 11 38L-3.6 38Q-5.6 33 -3.4 27.5Z", SHOE)}</g></g>`;
  const arm = (c, props = "", skin = "#E8B48C") => `<g class="${c}">${LN("M0 0Q1.2 14 0 27", 2.8)}<g class="fore">${LN("M0 0Q-1 12 0 23", 2.6)}${PC("M-2.8 21Q-5 29 0 31.5Q5.4 32 5 26.5Q7.2 24.6 5.6 22.2Q3.8 23.2 2.8 21Z", skin)}${props}</g></g>`;

  const star = (x, y, s, f = INK) => `<polygon transform="translate(${x} ${y}) scale(${s})" points="0,-12 3.5,-4 12,-4 5,2 8,11 0,6 -8,11 -5,2 -12,-4 -3.5,-4"${f === INK ? "" : ` fill="${f}" stroke="none"`}/>`;
  const PROPS = {
    mask: `<g class="pr pr-mask"><path d="M0 28L0 60" stroke="${INK}" stroke-width="2.4"/><g class="maskface" transform="translate(0 74)">${PC("M-15 -4Q-15 -17 0 -17Q15 -17 15 -4Q15 14 0 17Q-15 14 -15 -4Z", "#F3B23A")}${P("M-11 -5Q-7 -10 -3 -5Q-7 -2 -11 -5Z", DARK)}${P("M3 -5Q7 -10 11 -5Q7 -2 3 -5Z", DARK)}<path d="M-7 6Q0 13 7 6" fill="none" stroke="#8E2A1B" stroke-width="2.4"/>${CC(-16, -6, 2.4, "#E4572E")}${CC(16, -6, 2.4, "#E4572E")}</g></g>`,
    book: `<g class="pr pr-book">${PC("M-1 18L19 10L22 32L2 40Z", CREAM)}${PC("M-1 18L-16 14L-13 34L2 40Z", "#F6E7C8")}<path d="M3 22L17 16M4 27L18 21M5 32L19 26M-3 21L-12 18M-3 26L-11 23" fill="none" stroke="#9E8A70" stroke-width="1.4"/></g>`,
    broom: `<g class="pr pr-broom"><path d="M0 2L0 98" stroke="${INK}" stroke-width="2.6"/>${PC("M-15 124L15 124L7 98L-7 98Z", "#D9A441")}<path d="M-5 102L-8 121M0 102L0 121M5 102L8 121" fill="none" stroke="#8C6420" stroke-width="1.4"/><rect x="-8" y="95" width="16" height="5" fill="#B4532A"/></g>`,
    mag: `<g class="pr pr-mag"><path d="M0 28L0 46" stroke="${INK}" stroke-width="2.8"/><circle cx="0" cy="60" r="13" fill="#BFE0E8" fill-opacity="0.55" stroke="${INK}" stroke-width="2.8"/>${cut("M-6 54Q-3 51 1 51", 1.4)}</g>`,
    can: `<g class="pr pr-can"><path d="M14 30L28 22" stroke="${INK}" stroke-width="3"/>${PC("M-8 28L14 28L12 50L-6 50Z", "#2E8A99")}<path d="M-8 32Q-18 38 -8 46" fill="none" stroke="${INK}" stroke-width="2.4"/>`
      + [0, 1, 2].map((i) => `<circle class="drop" data-i="${i}" cx="30" cy="22" r="1.8" fill="#BFE0E8" stroke="none"/>`).join("") + `</g>`,
    wand: `<g class="pr pr-wand"><path d="M0 28L0 58" stroke="${INK}" stroke-width="2.2"/>${star(0, 68, 1.05, LIGHT)}</g>`,
  };

  /* figure frontali a colori: pelle, capelli e vestiti pieni, contorno color osso come un disegno ripassato */
  const HP = (d, f) => `<path d="${d}" fill="${f}"/>`;
  const SHIRT = "M-13 -123Q2 -128 17 -123Q21 -100 19 -74Q2 -70 -15 -74Q-17 -100 -13 -123Z";
  const BODY = {
    mia: PC(SHIRT, "#2E8A99") + PC("M-15 -90Q2 -94 19 -90L28 -50Q2 -44 -24 -50Z", "#E4572E")
      + [[-12, -60], [-2, -66], [8, -60], [18, -64], [3, -54], [-16, -54], [22, -54]].map(([x, y]) => DOT(x, y, 1.9, CREAM)).join("")
      + `<path d="M-4 -122Q2 -116 8 -122" fill="none" stroke="${CREAM}" stroke-width="1.8"/>`,
    teo: PC(SHIRT, "#F3B23A") + PC("M-15 -77L19 -77L20 -56L5 -56L2 -66L-1 -56L-16 -56Z", "#3F6E3A")
      + [-112, -102, -92].map((y) => DOT(2, y, 1.8, "#8E2A1B")).join("") + `<path d="M-6 -124Q2 -116 10 -124M8 -121L12 -104" fill="none" stroke="#E4572E" stroke-width="2.6"/>`,
    sole: PC(SHIRT, "#F7C948") + PC("M-15 -92Q2 -96 19 -92L27 -50L21 -54L15 -48L9 -54L3 -48L-3 -54L-9 -48L-15 -54L-23 -50Z", "#E89A2C")
      + DOT(2, -108, 4.2, "#E4572E") + [...Array(8)].map((_, i) => { const a = (i * PI) / 4; return `<path d="M${(2 + 6.5 * Math.cos(a)).toFixed(1)} ${(-108 + 6.5 * Math.sin(a)).toFixed(1)}L${(2 + 9.5 * Math.cos(a)).toFixed(1)} ${(-108 + 9.5 * Math.sin(a)).toFixed(1)}" fill="none" stroke="#E4572E" stroke-width="1.5"/>`; }).join(""),
    bea: PC("M-12 -123Q2 -127 16 -123L18 -108L-14 -108Z", "#8A4C7A") + PC("M-14 -110Q2 -114 18 -110L33 -6Q2 2 -29 -6Z", "#6D3B5E") + cut("M-13 -104L17 -104", 2.2)
      + [-20, -10, 0, 10, 20].map((x) => DOT(x + 2, -16, 1.9, LIGHT)).join("") + [-12, -2, 8, 18].map((x) => DOT(x - 1, -32, 1.6, LIGHT)).join(""),
    leo: PC("M-15 -124Q2 -130 19 -124Q24 -96 21 -60Q2 -55 -17 -60Q-20 -96 -15 -124Z", "#5E9C45")
      + `<path d="M2 -88Q-8 -98 2 -110Q12 -98 2 -88Z" fill="#B7D96B" stroke="#2F5A22" stroke-width="1.4"/><path d="M2 -90L2 -106" fill="none" stroke="#2F5A22" stroke-width="1.2"/>`,
  };
  const CAPE = PC("M-10 -120Q-30 -80 -38 -4L-14 -4Q-16 -60 -2 -118Z", "#B4532A") + star(-26, -40, 0.38, LIGHT) + star(-20, -74, 0.32, LIGHT);

  const HEAD = "M2 -178C17 -178 27 -167 27 -153C27 -138 17 -128 2 -128C-13 -128 -23 -138 -23 -153C-23 -168 -13 -178 2 -178Z";
  const FACE = `<circle cx="-13" cy="-144" r="3.6" fill="#E07A5F" opacity="0.6" stroke="none"/><circle cx="17" cy="-144" r="3.6" fill="#E07A5F" opacity="0.6" stroke="none"/>`
    + `<path d="M2 -150Q4.5 -146 1.5 -145" fill="none" stroke="#9A5A3C" stroke-width="1.4"/>`
    + `<g class="eye"><circle cx="-6" cy="-151" r="2.2" fill="${DARK}" stroke="none"/><circle cx="10" cy="-151" r="2.2" fill="${DARK}" stroke="none"/><circle cx="-5.3" cy="-151.8" r="0.7" fill="#fff" stroke="none"/><circle cx="10.7" cy="-151.8" r="0.7" fill="#fff" stroke="none"/></g>`
    + `<path d="M-10 -158Q-6 -161 -2 -158M6 -158Q10 -161 14 -158" fill="none" stroke="${DARK}" stroke-width="1.5"/><path class="mouth" d="M-3 -141Q2 -136.5 7 -141" fill="none" stroke="#8E2A1B" stroke-width="1.9"/>`;
  const HAIR = {
    pony: HP("M-24 -152Q-24 -181 2 -181Q28 -181 28 -152Q20 -167 2 -165Q-14 -167 -24 -152Z", "#7A4524") + HP("M-21 -164Q-43 -160 -38 -130Q-30 -134 -27 -150Z", "#7A4524")
      + P("M-21 -167L-30 -175L-30 -159ZM-21 -167L-12 -175L-12 -159Z", LIGHT),
    cap: HP("M-24 -155Q-25 -183 2 -183Q28 -183 28 -155Z", "#2E6FA8") + HP("M20 -157Q37 -160 41 -153L22 -152Z", "#245A8A") + CC(2, -184, 2.4, "#E4572E"),
    curls: HP("M-22 -158Q-20 -178 2 -178Q24 -178 26 -158Q14 -166 2 -165Q-10 -166 -22 -158Z", "#C8642A"),
    bob: HP("M-27 -150Q-30 -183 2 -184Q34 -183 31 -150L31 -130L21 -132L22 -150Q14 -163 2 -160Q-10 -163 -18 -150L-17 -132L-27 -130Z", "#F0CF6E"),
    tree: HP("M-23 -158Q-20 -181 2 -181Q24 -181 27 -158Q14 -168 2 -166Q-10 -168 -23 -158Z", "#2A1A14") + LN("M3 -181Q0 -192 4 -200", 2)
      + `<g fill="#7BBF4A" stroke="#EFE3CC" stroke-width="1.6"><path d="M4 -199Q-8 -210 -16 -200Q-6 -192 4 -199Z"/><path d="M4 -199Q14 -214 24 -206Q16 -194 4 -199Z"/><path d="M2 -190Q14 -196 18 -188Q10 -182 2 -190Z"/></g>`,
  };
  const RAYS = [[-20, -163], [-12, -175], [2, -181], [16, -175], [24, -163]].map(([x, y]) => CC(x, y, 7, "#C8642A")).join("")
    + [[-12, -175], [16, -175]].map(([x, y]) => `<path d="M${x - 3} ${y}a3 3 0 1 0 5 1" fill="none" stroke="#8A3E14" stroke-width="1.3"/>`).join("");
  const CROWN = `<path d="M-12 -177L-12 -193L-4 -185L3 -197L10 -185L18 -193L18 -177Z" fill="${LIGHT}"/>` + DOT(3, -182, 2, "#E4572E");
  const LASH = "";
  const ROD = "";

  const head = (hair, back = "", front = "", skin = "#E8B48C") => `<g class="head">${back}<path d="${HEAD}" fill="${skin}"/>${hair}${front}${FACE}</g>`;

  /* come sono fatti: pelle, grandezza, capelli, vestiti e l'oggetto che tengono in mano */
  const ASPETTO = {
    mia: { id: "mia", skin: "#F1C29B", s: 1.4, ph: 0.3, hair: HAIR.pony, torso: BODY.mia, girl: true, propsF: PROPS.broom },
    teo: { id: "teo", skin: "#D9A07A", s: 1.44, ph: 1.1, hair: HAIR.cap, torso: BODY.teo, propsF: PROPS.mask + PROPS.book },
    sole: { id: "sole", skin: "#EDB990", s: 1.36, ph: 2.0, hair: HAIR.curls, back: RAYS, torso: BODY.sole, girl: true },
    bea: { id: "bea", skin: "#F4CDAA", s: 1.46, ph: 2.7, hair: HAIR.bob, front: CROWN, behind: CAPE, torso: BODY.bea, girl: true, propsF: PROPS.wand },
    leo: { id: "leo", skin: "#C98B62", s: 1.5, ph: 3.6, hair: HAIR.tree, torso: BODY.leo, propsF: PROPS.can },
  };

  const pupSVG = (k) => `<g class="pup" id="pup-${k.id}"><g class="legs">${leg("legB")}${leg("legF")}</g><g class="upper">${ROD}${k.behind || ""}${arm("armB", "", k.skin)}${k.torso}${head(k.hair, k.back, k.front, k.skin)}${arm("armF", k.propsF, k.skin)}</g></g>`;

  const dleg = (x, far) => `<g class="dleg" data-x="${x}"${far ? ' opacity="0.75"' : ""}>${LN("M0 0Q1.6 30 0 58", 3.2)}${PC("M-4.5 56L5 56L5.5 66L-5 66Z", "#4A3A30")}</g>`;
  const DONKEY = `<g id="donkey">
    <g class="dtail">${LN("M0 0Q-12 18 -10 40", 2.6)}<path d="M-15 36Q-12 52 -5 40Q-8 34 -15 36Z" fill="#4A3A30"/></g>
    ${dleg(-30, true)}${dleg(30, true)}${dleg(-40, false)}${dleg(40, false)}
    ${PC("M-52 -92Q-55 -119 -18 -117Q22 -123 46 -108Q59 -98 53 -78Q48 -63 22 -63L-30 -63Q-56 -65 -52 -92Z", "#9C8F84")}
    ${PC("M-40 -66Q-10 -60 30 -66Q20 -76 -30 -76Z", "#C9BEB3")}
    ${PC("M-14 -117Q4 -120 21 -118L23 -76L-16 -76Z", "#E4572E")}<path d="M-15 -100L22 -101M-15 -88L23 -89" fill="none" stroke="${LIGHT}" stroke-width="2"/>
    <g class="dhead">
      ${PC("M33 -104Q40 -137 60 -151L73 -142Q58 -126 55 -96Z", "#9C8F84")}<path d="M39 -112l-5 -4l6 -3l-5 -5l7 -2l-4 -6l7 0l-2 -6l6 1" fill="none" stroke="#4A3A30" stroke-width="2.4"/>
      <g class="dears">${PC("M59 -158Q47 -187 54 -193Q66 -179 66 -158Z", "#8A7D72")}${PC("M66 -157Q66 -191 75 -193Q80 -176 73 -155Z", "#9C8F84")}<path d="M70 -162Q71 -178 74 -186" fill="none" stroke="#E8A9A0" stroke-width="2.2"/></g>
      ${PC("M56 -156Q66 -169 82 -161L103 -140Q109 -128 97 -124Q85 -122 74 -132Q62 -140 56 -156Z", "#9C8F84")}${PC("M86 -146Q100 -146 104 -136Q106 -126 96 -124Q86 -124 80 -132Z", "#D9CFC4")}
      <path d="M88 -132Q95 -127 101 -130" fill="none" stroke="${DARK}" stroke-width="1.6"/><circle cx="98" cy="-136" r="1.6" fill="${DARK}" stroke="none"/>
      <circle class="deye" cx="73" cy="-150" r="2.3" fill="${DARK}" stroke="none"/><path d="M69 -154Q73 -157 77 -154" fill="none" stroke="${DARK}" stroke-width="1.4"/>
    </g>
  </g>`;

  window.CIP = { INK, LIGHT, FILL, C, rivet, cut, P, LN, PC, CC, DOT, DARK, SHOE, CREAM, leg, arm, star, PROPS, HP, SHIRT, BODY, CAPE, HEAD, FACE, HAIR, RAYS, CROWN, LASH, ROD, head, ASPETTO, pupSVG, dleg, DONKEY };
})();
